## ADDED Requirements

### Requirement: 批量生成激活码 API
系统 SHALL 提供 `POST /api/admin/v1/activation-code-batches` 接口，需要 Admin session 认证。请求体：
- `skuId`: 必填 number，关联的 SKU ID
- `quantity`: 必填 number（1-1000），生成数量
- `batchNo`: 可选 string，批次号（不传则自动生成 `BATCH-{yyyyMMddHHmmss}`）
- `expiresAt`: 可选 ISO datetime，激活码过期时间（不传则永不过期）

#### Scenario: 成功批量生成
- **WHEN** Admin POST `{ skuId: 1, quantity: 10, batchNo: "BATCH-20260428" }`
- **THEN** 返回 200，data 包含 `codes` 数组（10 个激活码），每个激活码格式为 `ACT-{8位随机}-{4位随机}`，全部 status 为 `unused`

#### Scenario: SKU 不存在
- **WHEN** skuId 在 product_skus 表中不存在
- **THEN** 返回 400，message 为 "SKU 不存在"

#### Scenario: SKU 未启用激活码
- **WHEN** skuId 存在但 `activation_enabled` 为 false
- **THEN** 返回 400，message 为 "该 SKU 未启用激活码"

#### Scenario: 数量超限
- **WHEN** quantity > 1000
- **THEN** 返回 400，message 为 "单次生成数量不能超过 1000"

### Requirement: 激活码格式
每个激活码 SHALL 使用 `ACT-{8位大写字母数字}-{4位大写字母数字}` 格式，`UNIQUE` 约束保证唯一。

#### Scenario: 格式正确
- **WHEN** 生成激活码
- **THEN** 匹配正则 `^ACT-[A-Z0-9]{8}-[A-Z0-9]{4}$`
