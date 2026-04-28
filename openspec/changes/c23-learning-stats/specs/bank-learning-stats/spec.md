## ADDED Requirements

### Requirement: Single bank learning stats API
系统 SHALL 提供 `GET /api/v1/learning/stats/banks/:bankId` 接口，返回当前用户在指定题库下的学习统计。

#### Scenario: View bank-specific statistics
- **WHEN** 请求 `GET /api/v1/learning/stats/banks/153`
- **THEN** 系统 SHALL 返回该题库下的统计摘要，至少包含 `answeredQuestionsCount`、`correctAnswersCount`、`accuracyRate`、`practiceSessionCount`、`mockExamCount`、`totalStudyDurationMinutes`、`lastStudiedAt`

#### Scenario: Bank with no study activity
- **WHEN** 用户从未学习过该题库
- **THEN** 系统 SHALL 返回 0 值统计，而不是报错

#### Scenario: Bank not accessible to user
- **WHEN** 指定 bankId 不存在或当前用户无查看权限
- **THEN** 系统 SHALL 返回 404 或权限错误响应

### Requirement: Current bank context for statistics UI
学习统计页 SHALL 能基于当前题库上下文展示该题库统计，或在缺少当前题库时降级为全局视图。

#### Scenario: Current bank is configured
- **WHEN** 用户已在设置中选择当前题库
- **THEN** 页面 SHALL 可加载该题库的单题库统计摘要

#### Scenario: No current bank configured
- **WHEN** 用户尚未设置当前题库
- **THEN** 页面 SHALL 继续展示全局统计，不因缺少 bankId 而崩溃
