## 1. Schema 与 Migration

- [x] 1.1 创建 `src/lib/schema/wallet.ts`：定义 `wallet_accounts`、`wallet_ledger_entries` 表的 Drizzle schema
- [x] 1.2 更新 `src/lib/schema/index.ts`：导出 wallet schema 并建立与 `orders`、`payment_transactions` 的关联
- [x] 1.3 生成并执行 migration，创建钱包表和必要索引（至少包含 `wallet_ledger_entries(user_id, created_at desc)`）
- [x] 1.4 为现有用户补齐默认钱包账户初始化逻辑（余额 0）

## 2. 钱包查询与充值建单 API

- [x] 2.1 创建 `GET /api/v1/wallet`：返回余额、固定充值档位和账单摘要
- [x] 2.2 创建 `GET /api/v1/wallet/ledger`：分页返回用户钱包流水
- [x] 2.3 创建 `POST /api/v1/wallet/recharge-orders`：校验固定充值档位并创建 `recharge` 类型订单
- [x] 2.4 在订单/支付公共逻辑中补充 `recharge` 订单类型支持

## 3. 余额支付与入账事务

- [x] 3.1 创建 `POST /api/v1/orders/[orderId]/payments/wallet`：校验订单归属、状态和余额是否充足
- [x] 3.2 实现余额支付事务：锁定钱包账户、创建 `payment_transactions`、写入 `wallet_ledger_entries`、更新 `wallet_accounts` 和 `orders`
- [x] 3.3 在支付完成后的共用发放逻辑中支持钱包支付后的题库/资料包 entitlement 发放
- [x] 3.4 在微信支付回调或既有支付完成逻辑中补充 `recharge` 订单入账路径，确保充值成功后写入钱包流水

## 4. 小程序页面与交互

- [x] 4.1 创建 `pages/wallet`：展示余额、充值档位、”立即充值”按钮和”账单”入口
- [x] 4.2 创建 `pages/wallet-ledger`：展示账单明细列表与空状态
- [x] 4.3 更新订单支付页：展示钱包支付选项、余额不足提示和跳转充值能力
- [x] 4.4 新增小程序 `services/wallet.ts`：封装钱包查询、充值建单和余额支付请求

## 5. 验证

- [x] 5.1 覆盖关键用例：余额充足支付、余额不足支付、重复支付幂等、充值成功入账
- [x] 5.2 `npm run build` 验证通过
