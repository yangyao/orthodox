## ADDED Requirements

### Requirement: 激活码支付订单 API
系统 SHALL 提供 `POST /api/v1/orders/:orderId/payments/activation-code` 接口，需要 Bearer token 认证。请求体：`{ code: string }`。

该接口 SHALL：
1. 校验订单属于当前用户且 status 为 pending
2. 在事务中执行激活码兑换流程（同 redeem 的校验 + 锁定逻辑）
3. 校验激活码 SKU 与订单中的 SKU 匹配
4. 更新订单 status 为 `paid`，设置 `paidAt`
5. 插入 `activation_code_redemptions` 记录（关联 order_id）
6. 发放权益

#### Scenario: 成功用激活码支付订单
- **WHEN** 已登录用户对 pending 订单使用有效激活码，且激活码 SKU 与订单 SKU 匹配
- **THEN** 订单 status 变为 `paid`，激活码 status 变为 `redeemed`，用户获得权益，返回 200

#### Scenario: 订单非 pending 状态
- **WHEN** 订单 status 不为 pending
- **THEN** 返回 400，message 为 "订单状态不允许支付"

#### Scenario: 订单不属于当前用户
- **WHEN** 订单 userId 与当前用户不匹配
- **THEN** 返回 404，message 为 "订单不存在"

#### Scenario: 激活码 SKU 与订单不匹配
- **WHEN** 激活码关联的 SKU 不在订单的 order_items 中
- **THEN** 返回 400，message 为 "激活码与订单商品不匹配"

#### Scenario: 激活码无效或已使用
- **WHEN** 激活码不存在/已使用/已过期
- **THEN** 返回对应错误（与 redeem 相同的校验逻辑）
