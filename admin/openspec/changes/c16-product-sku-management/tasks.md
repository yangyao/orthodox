## 1. Schema 与 Migration

- [x] 1.1 创建 `src/lib/schema/products.ts`：定义 `catalog_products` 和 `product_skus` 表的 Drizzle schema
- [x] 1.2 更新 `src/lib/schema/index.ts`：添加 products 的 barrel export
- [x] 1.3 运行 `npm run db:generate` 和 `npm run db:migrate` 创建新表

## 2. 商品 CRUD API

- [x] 2.1 创建 `GET /api/admin/v1/products`：商品列表（分页 + productType/status/keyword 筛选，JOIN question_banks 取题库名）
- [x] 2.2 创建 `POST /api/admin/v1/products`：创建商品（校验 refId 对应题库存在）
- [x] 2.3 创建 `GET /api/admin/v1/products/[productId]`：商品详情（含 SKU 列表）
- [x] 2.4 创建 `PATCH /api/admin/v1/products/[productId]`：更新商品信息
- [x] 2.5 创建 `DELETE /api/admin/v1/products/[productId]`：软删除（status → archived）

## 3. SKU 管理 API

- [x] 3.1 创建 `POST /api/admin/v1/products/[productId]/skus`：添加 SKU（自动生成 sku_code）
- [x] 3.2 创建 `PATCH /api/admin/v1/products/[productId]/skus/[skuId]`：更新 SKU
- [x] 3.3 创建 `DELETE /api/admin/v1/products/[productId]/skus/[skuId]`：删除 SKU（校验属于该商品）

## 4. Admin 页面

- [x] 4.1 创建 `src/app/(dashboard)/products/page.tsx`：商品列表页（分页表格 + 类型/状态筛选 + "新建商品"按钮）
- [x] 4.2 创建 `src/app/(dashboard)/products/new/page.tsx`：新建商品页（选择类型→关联题库→填写信息）
- [x] 4.3 创建 `src/app/(dashboard)/products/[productId]/edit/page.tsx`：商品编辑页（基本信息 + 内嵌 SKU 表格管理）
- [x] 4.4 修改侧边栏导航，添加"商品管理"菜单项

## 5. 验证

- [x] 5.1 `npm run build` 验证通过
