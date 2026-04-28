## ADDED Requirements

### Requirement: Dashboard products API
系统 SHALL 提供 `GET /api/admin/v1/dashboard/products` 接口，返回商品与交易表现数据。

#### Scenario: View product sales ranking
- **WHEN** 管理员请求 `GET /api/admin/v1/dashboard/products?range=7d`
- **THEN** 系统 SHALL 返回商品榜单，至少包含 `productId`、`skuId`、`title`、`productType`、`soldCount`、`paidAmountFen`

#### Scenario: View recharge and payment breakdown
- **WHEN** 管理员查看商品看板
- **THEN** 系统 SHALL 返回充值金额、钱包支付金额、微信支付金额或等价支付方式分布字段

#### Scenario: Filter by product type
- **WHEN** 请求 `GET /api/admin/v1/dashboard/products?productType=bank`
- **THEN** 系统 SHALL 只返回题库商品相关榜单和汇总

### Requirement: Dashboard products section
后台首页 SHALL 展示商品与交易区块，支持榜单和支付方式概览。

#### Scenario: Render product leaderboard
- **WHEN** 商品看板接口返回成功
- **THEN** 页面 SHALL 展示商品销量榜或销售额榜，以及充值/支付方式摘要
