## 1. Schema 与 Migration

- [x] 1.1 创建 `src/lib/schema/orders.ts`：定义 `orders` 和 `order_items` 表的 Drizzle schema
- [x] 1.2 更新 `src/lib/schema/index.ts`：添加 orders 的 barrel export
- [x] 1.3 运行 `npm run db:generate` 和 `npm run db:migrate` 创建新表

## 2. 订单创建 API

- [x] 2.1 创建 `POST /api/v1/orders`：创建订单（校验 SKU 存在性/归属/状态、快照、金额计算、生成订单号、设置 30 分钟过期）

## 3. 订单查询 API

- [x] 3.1 创建 `GET /api/v1/orders`：用户订单列表（分页 + status 筛选，含惰性超时关闭）
- [x] 3.2 创建 `GET /api/v1/orders/[orderId]`：订单详情（含 order_items + snapshot，含惰性超时关闭）

## 4. 订单取消 API

- [x] 4.1 创建 `POST /api/v1/orders/[orderId]/cancel`：取消 pending 订单

## 5. Admin 订单 API

- [x] 5.1 创建 `GET /api/admin/v1/orders`：后台订单列表（分页 + status/orderType/userId/keyword 筛选，含惰性超时关闭）

## 6. 验证

- [x] 6.1 `npm run build` 验证通过
