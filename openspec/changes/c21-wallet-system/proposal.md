## Why

当前系统只有订单与微信支付主链路，没有用户钱包能力，无法支撑原型中的余额展示、固定档位充值、账单明细和余额支付。钱包系统需要在支付链路落地前定义清楚账户模型、流水规则和扣款事务边界，避免后续把余额字段直接散落到订单逻辑中。

## What Changes

- 新增用户钱包账户与账单流水能力，支持余额查询和账单列表。
- 新增固定充值档位的充值建单接口，复用订单系统创建 `recharge` 类型订单。
- 新增订单余额支付能力，支持余额校验、扣款记账、幂等保护和支付后状态更新。
- 新增小程序钱包页与账单明细页，承接原型中的“我的钱包”和“账单明细”页面。
- 规范钱包余额只允许通过流水驱动变更，禁止业务代码直接修改余额快照。

## Capabilities

### New Capabilities
- `wallet-account-browsing`: 用户可以查看钱包余额、充值档位和账单明细，并访问钱包相关页面。
- `wallet-recharge-ordering`: 用户可以按固定充值档位创建钱包充值订单。
- `wallet-order-payment`: 用户可以使用钱包余额支付待支付订单，系统完成扣款、记账和订单支付状态变更。

### Modified Capabilities
<!-- None -->

## Impact

- **Database**: 新增 `wallet_accounts`、`wallet_ledger_entries` 两张表，并要求与 `orders`、`payment_transactions` 关联。
- **Backend API**: 新增 `/api/v1/wallet`、`/api/v1/wallet/ledger`、`/api/v1/wallet/recharge-orders`、`/api/v1/orders/:orderId/payments/wallet`。
- **Mini-program**: 新增钱包首页和账单明细页；订单支付页需要展示“钱包支付”能力和余额不足反馈。
- **Order/Payment Flow**: `recharge` 类型订单在微信回调成功后需要入账；余额支付需要在事务内同时更新流水、余额和订单状态。
