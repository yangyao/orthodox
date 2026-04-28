## Why

C19 订单系统已就绪，C20 微信支付和 C21 钱包支付尚未实现，但目前需要一个零成本的兑换渠道让用户获取题库/资料包权限。激活码支持运营批量生成、线下发放（如培训合作、赠品活动），用户兑换后自动发放权益，无需支付系统先行就绪。

## What Changes

- 新建 `activation_codes` 和 `activation_code_redemptions` 表（Drizzle schema + migration）
- Admin API：`POST /api/admin/v1/activation-code-batches` 批量生成激活码、`GET /api/admin/v1/activation-codes` 查询激活码及核销记录
- 用户端 API：`POST /api/v1/activation-codes/redeem` 兑换激活码（直接发放权益，无需下单）
- 用户端 API：`POST /api/v1/orders/:orderId/payments/activation-code` 下单时用激活码支付
- 兑换时根据 SKU 关联的商品类型（bank/material）写入对应权益表（`user_bank_entitlements` / `user_material_entitlements`）
- 并发安全：`SELECT FOR UPDATE` 锁定激活码记录防止重复兑换

## Capabilities

### New Capabilities
- `activation-schema`: activation_codes / activation_code_redemptions 表结构与 migration
- `activation-batch`: Admin 批量生成激活码（指定 SKU、数量、过期时间、批次号）
- `activation-query`: Admin 查询激活码列表与核销记录
- `activation-redeem`: 用户兑换激活码（校验有效性、并发锁、发放权益）
- `activation-pay`: 用户下单时使用激活码支付订单

### Modified Capabilities
<!-- 无现有 spec 需要修改 -->

## Impact

- **Schema**: `src/lib/schema/activation-codes.ts` 新增，`src/lib/schema/index.ts` 更新
- **Migration**: 新增 migration 文件
- **Admin API**: `src/app/api/admin/v1/activation-code-batches/`、`activation-codes/` 新增
- **User API**: `src/app/api/v1/activation-codes/` 新增，`orders/[orderId]/payments/activation-code/` 新增
- **依赖**: 复用 `orders`、`productSkus`、`catalogProducts`、`userBankEntitlements` schema
