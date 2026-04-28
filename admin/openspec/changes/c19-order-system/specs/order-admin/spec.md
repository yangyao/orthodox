## ADDED Requirements

### Requirement: Admin 订单列表 API
系统 SHALL 提供 `GET /api/admin/v1/orders` 接口，需要 Admin session 认证。支持查询参数：
- `status`: 可选，筛选订单状态
- `orderType`: 可选，筛选订单类型
- `userId`: 可选，筛选用户 ID
- `keyword`: 可选，按 order_no 模糊搜索
- `page`/`pageSize`: 分页参数

#### Scenario: Admin 查询所有订单
- **WHEN** Admin GET `/api/admin/v1/orders`
- **THEN** 返回所有用户的订单列表（按 created_at 降序），分页结构，每个 item 含 `id`、`orderNo`、`userId`、`orderType`、`status`、`totalAmountFen`、`payAmountFen`、`createdAt`

#### Scenario: 按状态筛选
- **WHEN** GET `/api/admin/v1/orders?status=pending`
- **THEN** 仅返回 pending 状态的订单

#### Scenario: 按 order_no 搜索
- **WHEN** GET `/api/admin/v1/orders?keyword=ORD-202604`
- **THEN** 返回 order_no 包含该关键字的订单

#### Scenario: 超时订单惰性关闭
- **WHEN** Admin 查询时某 pending 订单已超过 expired_at
- **THEN** 该订单 status 被更新为 closed（与用户端查询行为一致）
