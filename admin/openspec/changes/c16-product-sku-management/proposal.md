## Why

题库内容管理已完成（C04-C07），但题库目前没有商品化的能力。要实现用户购买题库访问权限，首先需要管理员能够为题库（或资料包）创建商品 SPU，并为每个商品定义多个 SKU（不同价格、有效期、支付方式）。这是整个交易链路（订单→支付→授权）的前置依赖。

## What Changes

- 新建 `catalog_products` 表：存储商品 SPU（product_type 区分 bank/material，关联 question_banks 或 material_packs）
- 新建 `product_skus` 表：存储 SKU（价格、有效期、支付方式开关）
- Admin API：商品列表（分页+筛选）、创建/编辑/删除商品、SKU 批量管理
- Admin 页面：商品列表页、商品编辑页（关联题库 + SKU 管理）

## Capabilities

### New Capabilities
- `admin-product-crud`: 商品 SPU 管理 — CRUD API + 列表页，支持按 type/status 筛选，关联题库或资料包
- `admin-sku-management`: SKU 管理 — 在商品编辑页内嵌 SKU 列表，支持添加/编辑/删除 SKU，设置价格/有效期/支付方式

### Modified Capabilities
（无，C16 不改变已有功能的 spec）

## Impact

- **数据库**: 新建 `catalog_products` 和 `product_skus` 两张表，需要 migration
- **API 路由**: 新增 `/api/admin/v1/products`、`/api/admin/v1/products/[productId]`、`/api/admin/v1/products/[productId]/skus`、`/api/admin/v1/products/[productId]/skus/[skuId]`
- **Admin 页面**: 新增商品列表页 `/products`、商品编辑页 `/products/[productId]/edit`、新建商品页 `/products/new`
- **导航**: 侧边栏新增"商品管理"菜单项
- **依赖**: 无新外部依赖
