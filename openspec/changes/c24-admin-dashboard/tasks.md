## 1. 聚合口径与查询准备

- [x] 1.1 盘点 `orders`、`order_items`、`payment_transactions`、`wallet_ledger_entries`、`practice_sessions`、`practice_answers`、`exam_sessions` 的统计字段与状态口径
- [x] 1.2 为后台看板聚合查询补充必要索引（至少覆盖支付时间、订单状态、用户时间维度、商品维度）
- [x] 1.3 抽取 dashboard aggregation helper，统一总览、学习、商品三类统计逻辑

## 2. 后台看板 API

- [x] 2.1 创建 `GET /api/admin/v1/dashboard/overview`：返回 GMV、付费用户、订单数、学习活跃用户和基础趋势
- [x] 2.2 创建 `GET /api/admin/v1/dashboard/learning`：返回做题量、模考量、学习活跃与趋势数据
- [x] 2.3 创建 `GET /api/admin/v1/dashboard/products`：返回商品销量榜、充值金额和支付方式分布
- [x] 2.4 为三组接口接入后台认证与参数校验（`range=7d|30d`、可选筛选项）

## 3. 后台首页页面实现

- [x] 3.1 创建或重构后台首页 `src/app/(dashboard)/page.tsx`：作为仪表盘容器页面
- [x] 3.2 实现总览 KPI 卡片区
- [x] 3.3 实现学习数据图表区
- [x] 3.4 实现商品/交易榜单与支付方式区
- [x] 3.5 为各区块补充加载态、空态和请求失败兜底

## 4. 验证

- [x] 4.1 覆盖关键统计用例：无订单、有充值无商品支付、有商品支付、余额支付、学习数据为空、学习数据非空
- [x] 4.2 验证 7 天与 30 天窗口的聚合结果正确
- [x] 4.3 `npm run build` 验证通过
