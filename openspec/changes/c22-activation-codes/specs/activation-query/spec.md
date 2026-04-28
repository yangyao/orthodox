## ADDED Requirements

### Requirement: Admin 激活码列表 API
系统 SHALL 提供 `GET /api/admin/v1/activation-codes` 接口，需要 Admin session 认证。支持查询参数：
- `batchNo`: 可选，按批次号筛选
- `status`: 可选，按状态筛选（unused/redeemed/expired/disabled）
- `code`: 可选，按激活码模糊搜索
- `page`/`pageSize`: 分页参数

#### Scenario: 查询激活码列表
- **WHEN** Admin GET `/api/admin/v1/activation-codes`
- **THEN** 返回分页结构，每个 item 含 `id`、`code`、`skuId`、`batchNo`、`status`、`expiresAt`、`redeemedByUserId`、`redeemedAt`、`createdAt`

#### Scenario: 按批次号筛选
- **WHEN** GET `/api/admin/v1/activation-codes?batchNo=BATCH-20260428`
- **THEN** 仅返回该批次的激活码

#### Scenario: 按状态筛选
- **WHEN** GET `/api/admin/v1/activation-codes?status=unused`
- **THEN** 仅返回 unused 状态的激活码

### Requirement: Admin 核销记录查看
激活码列表查询返回结果 SHALL 包含已兑换码的 `redeemedByUserId` 和 `redeemedAt` 信息。

#### Scenario: 已兑换码显示核销信息
- **WHEN** 查询包含已兑换的激活码
- **THEN** 该码的 `status` 为 `redeemed`，`redeemedByUserId` 和 `redeemedAt` 不为空
