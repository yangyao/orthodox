## ADDED Requirements

### Requirement: 取消订单 API
系统 SHALL 提供 `POST /api/v1/orders/:orderId/cancel` 接口，需要 Bearer token 认证。

#### Scenario: 成功取消 pending 订单
- **WHEN** 已登录用户 POST 取消一个 status 为 pending 且属于该用户的订单
- **THEN** 订单 status 变为 `cancelled`，`cancelledAt` 设置为当前时间，返回 200

#### Scenario: 订单非 pending 状态
- **WHEN** 订单 status 不为 pending（如已 paid/cancelled/closed）
- **THEN** 返回 400，message 为 "订单状态不允许取消"

#### Scenario: 订单不属于当前用户
- **WHEN** 订单 userId 与当前用户不匹配
- **THEN** 返回 404，message 为 "订单不存在"

#### Scenario: 订单不存在
- **WHEN** orderId 在数据库中不存在
- **THEN** 返回 404，message 为 "订单不存在"

#### Scenario: 未登录
- **WHEN** 请求不含有效 Bearer token
- **THEN** 返回 401
