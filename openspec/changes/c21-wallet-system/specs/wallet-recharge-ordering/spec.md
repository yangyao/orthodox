## ADDED Requirements

### Requirement: Create wallet recharge order API
系统 SHALL 提供 `POST /api/v1/wallet/recharge-orders` 接口，根据固定充值档位创建充值订单。

#### Scenario: Create recharge order from fixed option
- **WHEN** 请求 `POST /api/v1/wallet/recharge-orders`，body 为 `{ "optionCode": "coins_30" }`
- **THEN** 系统 SHALL 创建一个 `orderType = recharge`、`status = pending` 的订单，并返回 `{ code: 0, data: { orderId, orderNo, payAmountFen, rechargeOption } }`

#### Scenario: Invalid recharge option
- **WHEN** 请求体中的 `optionCode` 不在服务端允许的充值档位中
- **THEN** 系统 SHALL 返回参数校验错误，HTTP 400

#### Scenario: Unauthenticated recharge order request
- **WHEN** 未登录用户请求创建充值订单
- **THEN** 系统 SHALL 返回 HTTP 401

### Requirement: Recharge options are server-defined
系统 SHALL 只允许使用后端定义的固定充值档位建单，不允许客户端传入任意金额。

#### Scenario: Client tries custom amount
- **WHEN** 请求 `POST /api/v1/wallet/recharge-orders`，body 为 `{ "amountFen": 1234 }`
- **THEN** 系统 SHALL 拒绝该请求，并提示只能选择固定充值档位

### Requirement: Recharge orders integrate with normal order flow
充值订单 SHALL 复用现有订单和支付链路，而不是建立单独充值单模型。

#### Scenario: Recharge order appears in order detail flow
- **WHEN** 用户成功创建充值订单
- **THEN** 系统 SHALL 为其生成标准订单编号，并允许后续通过微信支付链路继续支付

#### Scenario: Recharge payment succeeds
- **WHEN** 充值订单在后续支付流程中变为 `paid`
- **THEN** 系统 SHALL 仅入账到钱包余额，不创建题库或资料包 entitlement
