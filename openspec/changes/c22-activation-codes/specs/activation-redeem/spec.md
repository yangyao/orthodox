## ADDED Requirements

### Requirement: 兑换激活码 API
系统 SHALL 提供 `POST /api/v1/activation-codes/redeem` 接口，需要 Bearer token 认证。请求体：`{ code: string }`。

兑换 SHALL 在单个数据库事务中完成以下步骤：
1. `SELECT FOR UPDATE` 锁定 activation_codes 行
2. 校验激活码存在、状态为 unused、未过期
3. 更新激活码状态为 `redeemed`，记录兑换用户和时间
4. 插入 `activation_code_redemptions` 记录（result: success）
5. 根据 SKU 关联商品的 `productType` 写入权益表

#### Scenario: 成功兑换题库激活码
- **WHEN** 已登录用户 POST `{ code: "ACT-ABCD1234-EF56" }`，激活码关联 bank 类型 SKU
- **THEN** 返回 200，data 含 `result: "success"`、`productType: "bank"`、`skuTitle`、`validityDays`；用户获得该题库权益（`user_bank_entitlements` 新增一条）

#### Scenario: 激活码不存在
- **WHEN** 提交的 code 在数据库中不存在
- **THEN** 插入一条 result 为 `invalid` 的 redemption 记录（`activation_code_id` 为 null），返回 400，message 为 "激活码无效"

#### Scenario: 激活码已使用
- **WHEN** 激活码 status 不为 unused
- **THEN** 插入一条 result 为 `used` 的 redemption 记录，返回 400，message 为 "激活码已被使用"

#### Scenario: 激活码已过期
- **WHEN** 激活码 `expires_at < now()`
- **THEN** 更新激活码状态为 `expired`，插入 result 为 `expired` 的 redemption 记录，返回 400，message 为 "激活码已过期"

#### Scenario: 并发兑换同一激活码
- **WHEN** 两个用户同时兑换同一激活码
- **THEN** 只有一个成功，另一个收到 "激活码已被使用" 错误

#### Scenario: 未登录
- **WHEN** 请求不含有效 Bearer token
- **THEN** 返回 401

### Requirement: 权益发放规则
兑换成功后，系统 SHALL 根据 SKU 关联商品的 `productType` 写入对应权益表：
- `bank`：写入 `user_bank_entitlements`，`status = "active"`，`expiresAt = now() + sku.validityDays` 天（validityDays 为 null 则永不过期）
- `material`：写入 `user_material_entitlements`（如果该表存在），`source_type = "redeem"`

#### Scenario: 题库权益含有效期
- **WHEN** SKU 的 validityDays 为 30
- **THEN** `user_bank_entitlements.expiresAt` 为兑换时间 + 30 天

#### Scenario: 题库权益永久有效
- **WHEN** SKU 的 validityDays 为 null
- **THEN** `user_bank_entitlements.expiresAt` 为 null
