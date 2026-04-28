## ADDED Requirements

### Requirement: activation_codes 表结构
系统 SHALL 创建 `activation_codes` 表，包含以下字段：
- `id`: bigserial primary key
- `code`: varchar(64) unique not null，激活码
- `sku_id`: bigint not null references product_skus(id)
- `batch_no`: varchar(64)，批次号
- `status`: varchar(16) not null default `unused`，取值 `unused` / `redeemed` / `expired` / `disabled`
- `expires_at`: timestamptz，激活码过期时间
- `redeemed_by_user_id`: bigint references users(id)，兑换用户
- `redeemed_at`: timestamptz，兑换时间
- `created_at`: timestamptz not null default now()

#### Scenario: 表创建成功
- **WHEN** 执行 db:migrate
- **THEN** `activation_codes` 表存在，`code` 有 unique 约束

### Requirement: activation_code_redemptions 表结构
系统 SHALL 创建 `activation_code_redemptions` 表，包含以下字段：
- `id`: bigserial primary key
- `activation_code_id`: bigint not null references activation_codes(id)
- `user_id`: bigint not null references users(id)
- `order_id`: bigint references orders(id)，关联订单（直接兑换时为 null）
- `result`: varchar(16) not null，取值 `success` / `invalid` / `expired` / `used`
- `created_at`: timestamptz not null default now()

#### Scenario: 表创建成功
- **WHEN** 执行 db:migrate
- **THEN** `activation_code_redemptions` 表存在且外键正确

### Requirement: barrel export
系统 SHALL 在 `src/lib/schema/index.ts` 中导出 activation_codes 和 activation_code_redemptions schema。

#### Scenario: 导入可用
- **WHEN** 其他模块 `import { activationCodes, activationCodeRedemptions } from "@/lib/schema"`
- **THEN** 导入成功且类型正确
