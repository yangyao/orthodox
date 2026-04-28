## ADDED Requirements

### Requirement: orders 表结构
系统 SHALL 创建 `orders` 表，包含以下字段：
- `id`: bigserial primary key
- `order_no`: varchar(32) unique not null，订单号
- `user_id`: bigint not null references users(id)
- `order_type`: varchar(16) not null，取值 `bank` / `material` / `recharge`
- `status`: varchar(16) not null default `pending`，取值 `pending` / `paid` / `cancelled` / `closed` / `refunded`
- `total_amount_fen`: integer not null，订单总金额（分）
- `pay_amount_fen`: integer not null，实付金额（分）
- `currency`: char(3) not null default `CNY`
- `expired_at`: timestamptz，订单过期时间
- `paid_at`: timestamptz，支付完成时间
- `cancelled_at`: timestamptz，取消时间
- `created_at`: timestamptz not null default now()

#### Scenario: 表创建成功
- **WHEN** 执行 db:migrate
- **THEN** `orders` 表存在且包含上述所有字段，`order_no` 有 unique 约束

### Requirement: order_items 表结构
系统 SHALL 创建 `order_items` 表，包含以下字段：
- `id`: bigserial primary key
- `order_id`: bigint not null references orders(id) on delete cascade
- `product_id`: bigint not null references catalog_products(id)
- `sku_id`: bigint not null references product_skus(id)
- `quantity`: integer not null default 1
- `unit_price_fen`: integer not null，下单时 SKU 单价（分）
- `total_price_fen`: integer not null，小计金额（分）
- `snapshot`: jsonb not null，SKU 快照（标题、价格、有效期等）

#### Scenario: 表创建成功
- **WHEN** 执行 db:migrate
- **THEN** `order_items` 表存在且包含上述所有字段，`order_id` 外键关联 `orders.id`

### Requirement: barrel export
系统 SHALL 在 `src/lib/schema/index.ts` 中导出 orders 和 order_items schema。

#### Scenario: 导入可用
- **WHEN** 其他模块 `import { orders, orderItems } from "@/lib/schema"`
- **THEN** 导入成功且类型正确
