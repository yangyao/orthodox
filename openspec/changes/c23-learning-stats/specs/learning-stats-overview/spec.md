## ADDED Requirements

### Requirement: Learning overview API
系统 SHALL 提供 `GET /api/v1/learning/stats/overview` 接口，返回当前用户累计学习统计和当前周期核心指标。

#### Scenario: View cumulative overview
- **WHEN** 请求 `GET /api/v1/learning/stats/overview`
- **THEN** 系统 SHALL 返回累计指标，至少包含 `totalStudyDurationMinutes`、`completedUnitsCount`、`studyDaysCount`

#### Scenario: View current period highlights
- **WHEN** 用户打开学习统计页
- **THEN** 系统 SHALL 额外返回当前周期摘要，至少包含 `currentPeriod.studyDurationMinutes`、`currentPeriod.completedUnitsCount`、`currentPeriod.studyDaysCount` 和周期标签

#### Scenario: Overview for user without study data
- **WHEN** 用户尚未产生任何学习数据
- **THEN** 系统 SHALL 返回所有统计值为 0，而不是返回错误或 null

### Requirement: Learning statistics summary cards
小程序 `pages/stats` 的“学习统计”tab SHALL 展示累计数据卡片和周期摘要卡片。

#### Scenario: Render overview cards
- **WHEN** 学习统计总览请求成功
- **THEN** 页面 SHALL 展示累计学习时长、累计完成学习单元数等卡片
