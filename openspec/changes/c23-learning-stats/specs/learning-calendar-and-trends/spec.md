## ADDED Requirements

### Requirement: Learning calendar and trend API
系统 SHALL 提供 `GET /api/v1/learning/stats/calendar` 接口，返回趋势图数据和学习日历数据。

#### Scenario: Daily trend request
- **WHEN** 请求 `GET /api/v1/learning/stats/calendar?granularity=day&anchorDate=2026-04-28`
- **THEN** 系统 SHALL 返回日维度趋势数据 `series` 和对应月份的 `calendar` 数据

#### Scenario: Weekly or monthly trend request
- **WHEN** 请求 `granularity=week` 或 `granularity=month`
- **THEN** 系统 SHALL 返回对应粒度的趋势点列表，每个点至少包含时间标签、学习时长和完成学习单元数

#### Scenario: Calendar includes zero-value days
- **WHEN** 指定月份中部分日期无学习数据
- **THEN** 系统 SHALL 仍返回这些日期的 0 值或可推导空值，保证前端能渲染完整月历

### Requirement: Learning statistics period switcher
小程序“学习统计”tab SHALL 支持日/周/月切换，并在切换后刷新趋势图和周期摘要。

#### Scenario: Switch from day to week
- **WHEN** 用户点击“周”切换按钮
- **THEN** 页面 SHALL 使用 `granularity=week` 重新请求统计接口并刷新图表

#### Scenario: Calendar visible on statistics page
- **WHEN** 用户向下浏览学习统计页
- **THEN** 页面 SHALL 展示学习日历区域，并根据接口数据绘制对应月份热力图
