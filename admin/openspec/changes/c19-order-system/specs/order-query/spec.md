## ADDED Requirements

### Requirement: 订单列表 API
系统 SHALL 提供 `GET /api/v1/orders` 接口，需要 Bearer token 认证。支持查询参数：
- `status`: 可选，筛选订单状态（pending/paid/cancelled/closed/all，默认 all）
- `page`/`pageSize`: 分页参数

#### Scenario: 查询我的订单列表
- **WHEN** 已登录用户 GET `/api/v1/orders`
- **THEN** 返回当前用户的订单列表（按 created_at 降序），分页结构 `{ items, page, pageSize, total }`，每个 item 含 `id`、`orderNo`、`orderType`、`status`、`totalAmountFen`、`payAmountFen`、`createdAt`、`item`（order_item 摘要含 snapshot）

#### Scenario: 按状态筛选
- **WHEN** GET `/api/v1/orders?status=pending`
- **THEN** 仅返回 status 为 pending 的订单

#### Scenario: 未登录
- **WHEN** 请求不含有效 Bearer token
- **THEN** 返回 401

### Requirement: 订单详情 API
系统 SHALL 提供 `GET /api/v1/orders/:orderId` 接口，需要 Bearer token 认证。

#### Scenario: 查询订单详情
- **WHEN** 已登录用户 GET `/api/v1/orders/{orderId}` 且订单属于该用户
- **THEN** 返回完整订单信息，含 `id`、`orderNo`、`orderType`、`status`、`totalAmountFen`、`payAmountFen`、`expiredAt`、`paidAt`、`createdAt`、`items`（完整 order_items 含 snapshot）

#### Scenario: 订单不属于当前用户
- **WHEN** 订单 userId 与当前用户不匹配
- **THEN** 返回 404，message 为 "订单不存在"

#### Scenario: 订单不存在
- **WHEN** orderId 在数据库中不存在
- **THEN** 返回 404，message 为 "订单不存在"

### Requirement: 超时订单惰性关闭
查询订单（列表或详情）时，系统 SHALL 检查 pending 订单是否已超过 `expired_at`。若已超时，SHALL 将 status 更新为 `closed` 并设置 `cancelled_at`。

#### Scenario: 超时订单被关闭
- **WHEN** 查询时某 pending 订单的 `expired_at < now()`
- **THEN** 该订单 status 变为 `closed`，`cancelledAt` 被设置为当前时间，且在查询结果中 status 返回 `closed`

#### Scenario: 未超时订单不受影响
- **WHEN** pending 订单的 `expired_at > now()`
- **THEN** status 保持 `pending`
