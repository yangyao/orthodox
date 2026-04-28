## Context

C19 订单系统已完成，用户可创建 bank/material/recharge 三类订单。C20 微信支付和 C21 钱包尚未实现，但运营需要先有激活码渠道让用户获取题库权限。

现有基础设施：
- `orders` + `orderItems`：订单和订单项表
- `catalogProducts` + `productSkus`：商品与 SKU，SKU 有 `activationEnabled` 标志
- `userBankEntitlements`：题库授权表
- `user-material_entitlements`（C18 资料包中建立）：资料包授权表
- `authenticateUser`：JWT 用户认证
- BigInt ID + JSON 序列化 patch

## Goals / Non-Goals

**Goals:**
- Admin 可按 SKU 批量生成激活码（指定数量、过期时间、批次号）
- Admin 可查询激活码列表和核销记录
- 用户可兑换激活码，系统自动发放对应权益
- 用户下单时可用激活码作为支付方式
- 并发兑换安全（不会重复发放）

**Non-Goals:**
- 激活码 Admin 页面（本次只做 API）
- 退款后激活码回滚
- 激活码分组/标签管理
- 限量发行控制（如每人限用一张）

## Decisions

### 1. 激活码格式：`{8位大写字母数字}-{4位大写字母数字}`

- **选择**: `ACT-XXXXXXXX-XXXX` 格式（前缀 ACT + 12位随机字符）
- **替代方案**: 纯 UUID / 用户自定义
- **理由**: 可读性好，前缀区分类型，12 位随机字符碰撞概率极低。`UNIQUE` 约束兜底。

### 2. 权益发放策略

- **选择**: 兑换成功后根据 SKU 关联商品的 `productType` 决定写入哪张权益表
  - `bank` → `user_bank_entitlements`（设置 `expiresAt = now() + sku.validityDays`）
  - `material` → `user_material_entitlements`
- **替代方案**: 统一权益表
- **理由**: 与 C17 题库授权设计一致，银行和资料包权益独立建模。

### 3. 并发安全：SELECT FOR UPDATE

- **选择**: 兑换时用 `SELECT FOR UPDATE` 锁定 `activation_codes` 行
- **替代方案**: 乐观锁（version 字段）/ 唯一约束重试
- **理由**: 激活码是热点资源，一次兑换必须成功或失败，悲观锁最直接。Drizzle 支持 `.for("update")` 语法。

### 4. 两种使用路径

1. **直接兑换** (`POST /api/v1/activation-codes/redeem`)：无需订单，兑换即发放权益
2. **订单支付** (`POST /api/v1/orders/:orderId/payments/activation-code`)：创建 0 元订单，用激活码"支付"，记录完整链路

- **理由**: 直接兑换适合赠品场景，订单支付适合需要审计追踪的场景。两种路径都写入 `activation_code_redemptions`。

### 5. 事务内操作顺序

直接兑换时：
1. `SELECT FOR UPDATE` 锁定激活码 → 校验状态/过期
2. 更新激活码状态为 `redeemed`，记录 `redeemed_by_user_id` + `redeemed_at`
3. 插入 `activation_code_redemptions` 记录
4. 根据 SKU 类型插入权益记录
5. 全部在同一事务中完成

## Risks / Trade-offs

- **[SELECT FOR UPDATE 可能导致锁等待]** → 激活码兑换频率不高，锁持有时间极短（单次事务 < 100ms），可接受。
- **[激活码生成后无法修改 SKU 绑定]** → 设计上每个激活码绑定一个 SKU，生成后不可修改。如果 SKU 变更需重新生成。
- **[直接兑换不经过订单表]** → 权益来源追踪需要查询 `activation_code_redemptions` 表而非 `orders` 表。`source_type = "redeem"` + `source_ref_id` 指向 redemption 记录。
