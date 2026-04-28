## Context

C16 已建立 `catalog_products` 和 `product_skus` 表，Admin 可管理商品与 SKU。当前系统没有订单模型，用户无法下单。订单系统是微信支付（C20）、钱包支付（C21）、激活码（C22）的公共前置——所有支付方式都作用于同一个订单实体。

现有基础设施：
- Drizzle ORM + postgres.js 驱动
- `api-utils.ts`：统一响应 `success/error/paginate/parsePagination/validate`
- `user-auth.ts`：JWT Bearer token 认证（`authenticateUser`）
- BigInt ID 全局使用，`BigInt.prototype.toJSON` 已 patch

## Goals / Non-Goals

**Goals:**
- 用户可创建 bank/material/recharge 三类订单
- 用户可查询订单列表和详情
- 用户可取消 pending 状态订单
- Admin 可后台查看所有订单（筛选+分页）
- 订单创建时快照 SKU 信息，后续 SKU 变更不影响历史订单
- 订单超时自动关闭（惰性检查）

**Non-Goals:**
- 支付处理（C20 微信支付、C21 钱包）
- 权益发放（支付成功后的 entitlement 写入，留到 C20/C21）
- 退款流程
- 订单管理 Admin 页面（本次只做 API，页面留到后续）
- 延迟队列或 cron 定时关闭（用惰性检查替代）

## Decisions

### 1. 订单号格式：`ORD-{yyyyMMddHHmmss}-{6位随机数}`

- **选择**: 时间戳 + 随机数组合，32 字符以内
- **替代方案**: 数据库序列 / UUID
- **理由**: 时间有序（便于排查），随机后缀避免碰撞，比 UUID 短且可读。`UNIQUE` 约束兜底。

### 2. 超时关闭：惰性检查

- **选择**: 创建订单时设置 `expired_at = now() + 30min`，查询时检查是否超时并标记 `closed`
- **替代方案**: 定时任务 / 延迟消息队列（如 Redis BullMQ）
- **理由**: 无需引入额外基础设施。当前量级下惰性检查足够，后续量级上来再补定时任务。30 分钟过期时间符合微信支付未支付订单的超时窗口。

### 3. 快照策略：order_items.snapshot 存储 SKU 快照

- **选择**: 创建订单时将 SKU 标题、价格、有效期等写入 `order_items.snapshot`（JSONB）
- **替代方案**: 额外表存储快照字段
- **理由**: 单字段 JSONB 最简单，查询时直接取 snapshot 展示，无需 JOIN 已变更的 SKU 表。

### 4. 订单状态机

```
pending → paid（C20/C21 支付成功后设置）
pending → cancelled（用户主动取消）
pending → closed（超时自动关闭）
paid → refunded（后续退款流程）
```

- pending: 初始状态，等待支付
- paid: 支付成功（C20/C21 写入）
- cancelled: 用户主动取消
- closed: 超时关闭
- refunded: 已退款（后续）

### 5. 创建订单：单 SKU 简化

- **选择**: 创建接口接受 `items` 数组，但当前每个订单仅含一个 order_item
- **理由**: 架构文档设计为数组以支持未来多品，但当前业务每个订单只买一个 SKU。接口结构预留扩展空间，实现上简化校验。

## Risks / Trade-offs

- **[超时订单可能短暂显示为 pending]** → 惰性检查意味着超时后到首次查询前，订单仍显示 pending。前端可配合展示倒计时，缓解用户困惑。可接受，后续补定时任务。
- **[order_items.snapshot 无 schema 校验]** → JSONB 内容不受 DB 约束。在应用层用 Zod 校验写入内容，保证格式一致。
- **[订单号碰撞]** → 6 位随机数理论上有百万分之一碰撞概率。`UNIQUE` 绯比约束 + 创建时 catch 唯一冲突重试即可。
