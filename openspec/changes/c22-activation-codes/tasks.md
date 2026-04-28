## 1. Schema 与 Migration

- [x] 1.1 创建 `src/lib/schema/activation-codes.ts`：定义 `activation_codes` 和 `activation_code_redemptions` 表的 Drizzle schema
- [x] 1.2 更新 `src/lib/schema/index.ts`：添加 activation-codes 的 barrel export
- [x] 1.3 运行 `npm run db:generate` 和 `npm run db:migrate` 创建新表

## 2. Admin 批量生成 API

- [x] 2.1 创建 `POST /api/admin/v1/activation-code-batches`：批量生成激活码（校验 SKU 存在性/activationEnabled、生成 ACT-XXXXXXXX-XXXX 格式码、支持 batchNo/expiresAt）

## 3. Admin 查询 API

- [x] 3.1 创建 `GET /api/admin/v1/activation-codes`：激活码列表（分页 + batchNo/status/code 筛选）

## 4. 用户兑换 API

- [x] 4.1 创建 `POST /api/v1/activation-codes/redeem`：兑换激活码（SELECT FOR UPDATE、校验状态/过期、事务内更新状态+发放权益）

## 5. 激活码支付订单 API

- [x] 5.1 创建 `POST /api/v1/orders/[orderId]/payments/activation-code`：用激活码支付订单（校验订单状态+归属、激活码 SKU 匹配、事务内支付+发放权益）

## 6. 验证

- [x] 6.1 `npm run build` 验证通过
