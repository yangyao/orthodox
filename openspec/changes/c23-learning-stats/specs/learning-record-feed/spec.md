## ADDED Requirements

### Requirement: Learning record feed API
系统 SHALL 提供 `GET /api/v1/learning/records` 接口，按时间倒序返回当前用户的学习记录流。

#### Scenario: View mixed learning records
- **WHEN** 请求 `GET /api/v1/learning/records?page=1&pageSize=20`
- **THEN** 系统 SHALL 返回 `{ code: 0, data: { items: [...], page, pageSize, total } }`，其中 items 可包含 `practice` 和 `mock_exam` 两类记录

#### Scenario: Record item structure
- **WHEN** 用户查看学习记录流
- **THEN** 每条记录 SHALL 至少包含 `recordType`、`bankId`、`bankName`、`title`、`startedAt`、`completedAt`、`durationSeconds` 和摘要字段

#### Scenario: Empty learning record feed
- **WHEN** 用户尚未完成任何练习或模考
- **THEN** 系统 SHALL 返回空列表，前端可展示“您还没有学习任何课程/去逛逛”空状态

### Requirement: Learning record page tab
小程序 `pages/stats` SHALL 提供“学习记录”tab，展示学习记录流与空状态。

#### Scenario: Open learning records tab
- **WHEN** 用户进入学习轨迹页面并停留在“学习记录”tab
- **THEN** 页面 SHALL 请求 `GET /api/v1/learning/records` 并渲染记录列表

#### Scenario: Empty state call to action
- **WHEN** 学习记录为空
- **THEN** 页面 SHALL 展示空状态插画和“去逛逛”按钮
