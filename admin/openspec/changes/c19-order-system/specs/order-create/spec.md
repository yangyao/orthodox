## ADDED Requirements

### Requirement: 创建订单 API
系统 SHALL 提供 `POST /api/v1/orders` 接口，需要 Bearer token 认证。请求体：
- `orderType`: 必填，枚举 `bank` / `material` / `recharge`
- `items`: 必填数组，每项含 `productId`(number)、`skuId`(number)、`quantity`(number, default 1)

#### Scenario: 成功创建题库订单
- **WHEN** 已登录用户 POST `{ orderType: "bank", items: [{ productId: 1, skuId: 1, quantity: 1 }] }`
- **THEN** 返回 200，data 包含 `orderId`、`orderNo`（格式 `ORD-{yyyyMMddHHmmss}-{6位随机}`）、`status: "pending"`、`payAmountFen`、`expiresAt`（当前时间 +30 分钟）

#### Scenario: SKU 不存在
- **WHEN** 提交的 skuId 在 product_skus 表中不存在
- **THEN** 返回 400，message 为 "SKU 不存在"

#### Scenario: SKU 不属于该商品
- **WHEN** 提交的 skuId 存在但其 product_id 与 productId 不匹配
- **THEN** 返回 400，message 为 "SKU 不属于该商品"

#### Scenario: SKU 已下架
- **WHEN** 提交的 skuId 存在但 status 不为 active
- **THEN** 返回 400，message 为 "SKU 已下架"

#### Scenario: 未登录
- **WHEN** 请求不含 Bearer token 或 token 无效
- **THEN** 返回 401，message 为 "未登录" 或 "登录已过期"

### Requirement: 订单号生成
系统 SHALL 使用 `ORD-{yyyyMMddHHmmss}-{6位随机数}` 格式生成订单号，保证唯一。若碰撞 SHALL 自动重试（最多 3 次）。

#### Scenario: 订单号格式正确
- **WHEN** 创建订单成功
- **THEN** `orderNo` 匹配正则 `^ORD-\d{14}-\d{6}$`

### Requirement: SKU 快照
创建订单时 SHALL 将 SKU 的 `title`、`priceFen`、`originalPriceFen`、`validityDays` 写入 `order_items.snapshot`。

#### Scenario: 快照内容完整
- **WHEN** 创建订单成功
- **THEN** `order_items.snapshot` 包含 `title`、`priceFen`、`originalPriceFen`、`validityDays` 字段

### Requirement: 金额计算
创建订单时 SHALL 使用 SKU 当前价格计算金额：`unit_price_fen = sku.price_fen`，`total_price_fen = unit_price_fen * quantity`，`total_amount_fen = sum(items.total_price_fen)`，`pay_amount_fen = total_amount_fen`。

#### Scenario: 单品订单金额正确
- **WHEN** SKU 价格为 9900 分，quantity 为 1
- **THEN** `totalAmountFen = 9900`，`payAmountFen = 9900`
