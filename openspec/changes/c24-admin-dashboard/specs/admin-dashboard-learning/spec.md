## ADDED Requirements

### Requirement: Dashboard learning API
系统 SHALL 提供 `GET /api/admin/v1/dashboard/learning` 接口，返回学习域核心统计数据。

#### Scenario: View learning dashboard data
- **WHEN** 管理员请求 `GET /api/admin/v1/dashboard/learning?range=7d`
- **THEN** 系统 SHALL 返回学习统计摘要，至少包含 `practiceSessionCount`、`practiceAnswerCount`、`mockExamCount`、`activeLearningUserCount` 和趋势序列

#### Scenario: Learning trends by fixed range
- **WHEN** 请求 `range=30d`
- **THEN** 系统 SHALL 返回 30 天窗口内的趋势点数据，可用于折线图或柱状图

#### Scenario: Learning dashboard with no activity
- **WHEN** 当前统计窗口内尚无学习数据
- **THEN** 系统 SHALL 返回 0 值统计和空趋势数组，而不是错误

### Requirement: Dashboard learning section
后台首页 SHALL 提供学习数据区块，展示做题量、模考量和学习活跃趋势。

#### Scenario: Render learning charts
- **WHEN** 学习看板接口返回成功
- **THEN** 页面 SHALL 展示学习域卡片和至少一个趋势图区域
