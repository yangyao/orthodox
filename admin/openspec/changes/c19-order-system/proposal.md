## Why

C16 已完成商品与 SKU 管理，用户可以浏览题库/资料包商品，但目前没有下单和支付能力。订单系统是整个支付链路（微信支付 C20、钱包 C21、激活码 C22）的前置依赖——没有订单，支付无载体。需要先建立订单创建、查询、取消的基础能力，后续支付方式才能逐一接入。

## What Changes

- 新建 `orders` 和 `order_items` 表（Drizzle schema + migration）
- 用户端 API：`POST /api/v1/orders` 创建订单（bank/material/recharge 三种类型）、`GET /api/v1/orders` 订单列表、`GET /api/v1/orders/:orderId` 订单详情、`POST /api/v1/orders/:orderId/cancel` 取消订单
- Admin API：`GET /api/admin/v1/orders` 后台订单查看（分页 + 筛选）
- 订单号生成规则：`ORD-{yyyyMMddHHmmss}-{6位随机数}`
- 订单超时自动关闭（创建时设置 `expired_at`，查询时检查并标记为 `closed`）
- 创建订单时快照 SKU 信息到 `order_items.snapshot`（JSONB），防止后续 SKU 变更影响历史订单

## Capabilities

### New Capabilities
- `order-schema`: orders / order_items 表结构与 migration
- `order-create`: 用户创建订单（校验 SKU 存在性、快照价格、计算总金额、设置过期时间）
- `order-query`: 用户订单列表与详情查询（含超时订单惰性关闭）
- `order-cancel`: 用户取消待支付订单
- `order-admin`: Admin 后台订单查看（分页、按状态/类型/用户筛选）

### Modified Capabilities
<!-- 无现有 spec 需要修改 -->

## Impact

- **Schema**: `src/lib/schema/orders.ts` 新增，`src/lib/schema/index.ts` 添加 barrel export
- **Migration**: 新增 migration 文件
- **User API**: `src/app/api/v1/orders/` 下新增 route handlers
- **Admin API**: `src/app/api/admin/v1/orders/route.ts` 新增
- **依赖**: 复用已有 `catalogProducts`、`productSkus` schema，复用 `api-utils.ts` 的分页/校验工具
