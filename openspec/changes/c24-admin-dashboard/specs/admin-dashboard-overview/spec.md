## ADDED Requirements

### Requirement: Dashboard overview API
系统 SHALL 提供 `GET /api/admin/v1/dashboard/overview` 接口，返回后台首页总览指标。

#### Scenario: View overview metrics
- **WHEN** 管理员请求 `GET /api/admin/v1/dashboard/overview?range=7d`
- **THEN** 系统 SHALL 返回 `{ code: 0, data: { range, cards: {...}, trends: {...} } }`，其中 `cards` 至少包含 `gmvFen`、`paidUserCount`、`paidOrderCount`、`activeLearningUserCount`

#### Scenario: Separate recharge from GMV
- **WHEN** 管理员查看总览指标
- **THEN** 系统 SHALL 不把钱包充值金额并入商品 GMV，而是作为独立字段返回或在其他区块单独呈现

#### Scenario: Unauthorized request to overview
- **WHEN** 未登录或无权限用户请求总览接口
- **THEN** 系统 SHALL 返回后台认证错误响应

### Requirement: Dashboard home page overview cards
后台首页 SHALL 展示总览 KPI 卡片和基础趋势区块。

#### Scenario: Admin opens dashboard home
- **WHEN** 管理员访问后台首页
- **THEN** 页面 SHALL 请求总览接口并展示 GMV、付费用户、订单数、学习活跃用户等卡片

#### Scenario: Overview loading state
- **WHEN** 总览接口仍在加载
- **THEN** 页面 SHALL 展示卡片骨架屏或加载态，而不是空白区域
