## ADDED Requirements

### Requirement: Wallet payment API
系统 SHALL 提供 `POST /api/v1/orders/[orderId]/payments/wallet` 接口，允许用户使用钱包余额支付待支付订单。

#### Scenario: Pay pending order with sufficient balance
- **WHEN** 请求 `POST /api/v1/orders/100/payments/wallet`，订单属于当前用户、状态为 `pending` 且钱包余额充足
- **THEN** 系统 SHALL 返回 `{ code: 0, data: { orderId, paymentMethod: "wallet", status: "paid" } }`，并将订单标记为已支付

#### Scenario: Insufficient wallet balance
- **WHEN** 钱包余额小于订单应付金额
- **THEN** 系统 SHALL 返回 `{ code: -1, message: "钱包余额不足", data: { shortfallFen } }`，HTTP 400

#### Scenario: Order not owned by current user
- **WHEN** 当前用户尝试支付他人的订单
- **THEN** 系统 SHALL 返回 HTTP 404 或 403，且不得泄露订单详情

#### Scenario: Order already paid
- **WHEN** 对已支付订单重复调用钱包支付接口
- **THEN** 系统 SHALL 不重复扣款，并返回该订单已支付状态或幂等成功响应

### Requirement: Wallet deduction creates ledger and payment record
余额支付成功时，系统 SHALL 在同一个事务中写入支付记录、钱包流水并更新余额快照。

#### Scenario: Successful wallet payment bookkeeping
- **WHEN** 余额支付成功
- **THEN** 系统 SHALL 创建 `payment_transactions(payment_method=wallet, status=success)`，写入一条 `wallet_ledger_entries(entry_type=debit, direction=out)`，并更新 `wallet_accounts.balance_fen`

#### Scenario: Transaction failure rolls back deduction
- **WHEN** 写入支付记录或更新订单状态的过程中任一步骤失败
- **THEN** 系统 SHALL 回滚本次余额扣减，不得留下半成功流水

### Requirement: Wallet payment triggers downstream fulfillment
余额支付成功后，系统 SHALL 复用标准支付完成后的发放逻辑。

#### Scenario: Bank order paid by wallet
- **WHEN** 用户使用钱包支付题库订单成功
- **THEN** 系统 SHALL 按订单商品类型发放对应的题库 entitlement

#### Scenario: Material order paid by wallet
- **WHEN** 用户使用钱包支付资料包订单成功
- **THEN** 系统 SHALL 写入对应的 `user_material_entitlements`
