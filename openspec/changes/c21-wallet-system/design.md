## Context

原型里已有完整的钱包入口，包括余额展示、固定充值档位、账单明细以及在订单支付页选择“钱包支付”的能力。但当前系统设计只覆盖订单、微信支付和题库/资料包授权，尚未建立专门的钱包账户和流水模型。

钱包能力的难点不在页面，而在记账一致性：充值到账、余额支付、退款或调整都必须留下可追溯流水，且任何余额变动都需要与订单/支付事务对齐。由于 C21 位于 C19 订单系统和 C20 微信支付之后，本变更需要与现有 `orders`、`order_items`、`payment_transactions` 模型协同，而不是另起一套简化账本。

## Goals / Non-Goals

**Goals:**
- 为每个用户建立独立钱包账户和余额快照。
- 通过 `wallet_ledger_entries` 记录所有资金流入流出，并与订单/支付记录关联。
- 支持固定充值档位创建 `recharge` 类型订单。
- 支持对待支付订单使用钱包余额支付，并在一个事务里完成扣款、流水写入、订单状态更新。
- 提供钱包页和账单明细页所需的后端能力。

**Non-Goals:**
- 不实现提现、分账、收益结算等资金结算场景。
- 不实现任意金额自定义充值，首版仅支持固定档位。
- 不在本 change 内处理退款流程；退款只要求数据模型兼容，具体回退逻辑留给后续 change。
- 不实现后台人工调账页面；若后续需要，可基于现有流水模型追加能力。

## Decisions

### 1. 使用“余额快照 + 流水账”的双表模型

- `wallet_accounts` 负责存储每个用户当前 `balance_fen` 与 `frozen_fen` 快照。
- `wallet_ledger_entries` 记录每次变更，字段至少包括 `entry_type`、`direction`、`amount_fen`、`balance_after_fen`、`order_id`、`payment_txn_id`、`remark`。

**为什么这样做:**
- 直接在 `users` 或 `orders` 上挂余额字段，无法支撑账单明细和审计。
- 只做流水、不做快照，会让高频余额查询成本过高。

**备选方案:**
- 只维护 `wallet_accounts.balance_fen`，不保留流水。
  - 放弃原因：账单页无法落地，且无法追查错账。
- 只维护流水，实时聚合余额。
  - 放弃原因：小程序钱包页与支付校验都是高频读，不适合每次聚合全量流水。

### 2. 充值仍然复用订单系统，而不是单独充值表

- `POST /api/v1/wallet/recharge-orders` 只负责选择固定充值档位并创建 `order_type = recharge` 的普通订单。
- 后续微信支付成功后，由既有支付回调在识别到 `recharge` 订单时写入一条 `wallet_ledger_entries(entry_type=recharge, direction=in)`，并更新 `wallet_accounts.balance_fen`。

**为什么这样做:**
- 充值本质仍然是支付订单，复用订单与支付事务能减少分叉逻辑。
- 原型中的“账单明细”与“我的订单”都需要看到充值记录，统一建模最稳。

### 3. 余额支付以“先记流水，再更新余额快照，再更新订单”为单事务顺序

- `POST /api/v1/orders/:orderId/payments/wallet` 必须锁定 `wallet_accounts` 和目标订单。
- 校验项包括：
  - 订单属于当前用户。
  - 订单状态仍为 `pending`。
  - 订单类型允许余额支付。
  - 钱包余额充足。
- 扣款成功后：
  - 创建 `payment_transactions(payment_method=wallet, status=success)`。
  - 写入 `wallet_ledger_entries(entry_type=debit, direction=out)`。
  - 更新 `wallet_accounts.balance_fen`。
  - 更新 `orders.status=paid` 与 `paid_at`。
  - 触发后续题库/资料包权益发放。

**为什么这样做:**
- 账务变更和订单支付必须一致提交，不能出现“余额扣了但订单没成功”。
- 把 `payment_transactions` 保留下来，可以与微信支付保持统一支付抽象。

### 4. 首版充值档位采用后端固定配置，不引入独立充值套餐表

- 钱包首页返回固定充值选项，例如 `[{ coins: 6, amountFen: 600 }, { coins: 30, amountFen: 3000 }]`。
- 档位可先放在服务端常量或配置文件中，避免在 C21 再引入一张运营表。

**为什么这样做:**
- 当前原型只有固定档位展示，没有后台维护充值套餐的要求。
- 先做静态档位能把注意力集中在资金模型和事务安全上。

**备选方案:**
- 新增 `wallet_recharge_packages` 表并开放后台管理。
  - 放弃原因：超出 C21 最小闭环，且实施计划没有对应 Admin 范围。

### 5. 余额支付与充值都必须是幂等入口

- 余额支付通过订单状态和 `payment_transactions` 唯一约束保证幂等。
- 同一充值订单即使收到重复回调，也只能入账一次。

**为什么这样做:**
- 钱包是资金域，重复扣款或重复入账都是高风险错误。

## Risks / Trade-offs

- **[Risk] 并发扣款导致超卖余额** → 使用数据库事务和 `SELECT ... FOR UPDATE` 锁定 `wallet_accounts` 行。
- **[Risk] 充值回调重复触发导致重复入账** → 对 `payment_transactions.provider_trade_no` 和充值订单状态做幂等检查。
- **[Risk] 固定充值档位后续需要运营配置** → 首版先用静态配置，后续若出现运营需求再独立成新 change。
- **[Risk] 钱包支付成功后权益发放失败** → 保持支付与订单状态提交成功，同时把权益发放设计成可重试的后续步骤，避免资金回滚复杂化。

## Migration Plan

1. 创建 `wallet_accounts` 与 `wallet_ledger_entries` schema 和 migration。
2. 为现有用户补齐空钱包账户，默认余额为 0。
3. 上线钱包查询与充值建单接口。
4. 在支付回调逻辑中补充 `recharge` 订单入账路径。
5. 上线余额支付接口与小程序钱包页/账单页。

回滚策略：
- 若仅前端页面或查询接口出问题，可先关闭钱包入口，不影响已有订单主链路。
- 若余额支付逻辑有问题，可临时禁用 `/payments/wallet` 路由，保留充值与账单能力。
- 禁止通过回滚 migration 直接删除流水表；资金数据只能追加修正，不能简单回滚丢失。

## Open Questions

- 充值档位的“币”和人民币是否始终 1:1；若未来存在赠送币，需要在后续 change 补充赠送字段。
- 余额不足时，前端是直接阻止点击，还是允许提交后返回“余额不足”并引导去充值；当前建议两层都做。
- 是否需要在“我的订单”中把充值订单和商品订单混排展示；本 change 先只保证模型兼容。
