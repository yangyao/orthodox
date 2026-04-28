## Why

随着题库、订单、支付、钱包和学习统计能力逐步落地，管理后台需要一个统一的运营入口来查看业务健康度，否则管理员只能在多个列表页之间来回切换，无法快速判断 GMV、付费转化、学习活跃和商品表现。后台看板需要尽早定义清楚数据口径和页面结构，避免后续各模块各自输出不一致的“统计数”。

## What Changes

- 新增后台总览看板接口，返回 GMV、付费用户、订单数、活跃用户等核心指标。
- 新增后台学习看板接口，返回做题量、模考量、学习活跃趋势等学习域数据。
- 新增后台商品看板接口，返回题库/资料包销量、充值金额、支付方式分布等商品与交易表现。
- 新增后台仪表盘首页，聚合卡片、趋势图和榜单，作为管理员登录后的默认落地页。
- 明确后台看板的统计口径优先基于订单、支付、练习和模考原始数据聚合，不新增独立数据仓库。

## Capabilities

### New Capabilities
- `admin-dashboard-overview`: 管理员可以查看后台首页的总览指标与基础趋势。
- `admin-dashboard-learning`: 管理员可以查看学习活跃、做题量、模考量等学习域看板数据。
- `admin-dashboard-products`: 管理员可以查看商品销量、充值表现、支付方式分布等商品与交易数据。

### Modified Capabilities
<!-- None -->

## Impact

- **Backend API**: 新增 `/api/admin/v1/dashboard/overview`、`/api/admin/v1/dashboard/learning`、`/api/admin/v1/dashboard/products`。
- **Admin UI**: 新增或重构后台仪表盘首页 `admin/src/app/(dashboard)/page.tsx`，并补充图表/卡片组件。
- **Aggregation Logic**: 复用 `orders`、`payment_transactions`、`wallet_ledger_entries`、`practice_sessions`、`exam_sessions` 聚合业务指标。
- **Permissions**: 这些接口默认受现有后台认证保护，仅管理员可访问。
