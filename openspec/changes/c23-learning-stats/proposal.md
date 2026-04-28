## Why

用户在完成练习、模考和错题复习后，需要看到连续性的学习反馈，否则“学习轨迹”页面只会停留在空壳导航。当前系统已有练习历史和模考记录，但还没有把这些数据聚合成学习记录流、累计统计、趋势图和日历热力图。

## What Changes

- 新增学习记录流接口，聚合用户的练习会话和模考会话，供“学习记录”tab 展示。
- 新增学习统计总览接口，返回累计学习时长、完成学习单元数、学习天数等核心指标。
- 新增学习趋势与学习日历接口，支持日/周/月维度切换和日历热力图展示。
- 新增单题库统计接口，支持从当前题库视角查看作答量、正确率、模考次数等数据。
- 新增小程序 `pages/stats` 页面，实现“学习记录 / 学习统计”双 tab、空状态和数据加载交互。

## Capabilities

### New Capabilities
- `learning-record-feed`: 用户可以浏览按时间倒序排列的学习记录流。
- `learning-stats-overview`: 用户可以查看累计学习数据和当前周期核心指标。
- `learning-calendar-and-trends`: 用户可以查看日/周/月学习趋势和学习日历热力图。
- `bank-learning-stats`: 用户可以查看单题库维度的统计摘要。

### Modified Capabilities
<!-- None -->

## Impact

- **Backend API**: 新增 `/api/v1/learning/records`、`/api/v1/learning/stats/overview`、`/api/v1/learning/stats/calendar`、`/api/v1/learning/stats/banks/:bankId`。
- **Data Aggregation**: 复用 `practice_sessions`、`practice_answers`、`exam_sessions`、`exam_answers` 进行统计聚合，不新增核心业务表。
- **Mini-program**: 新增或重构 `pages/stats`，实现双 tab、折线趋势图和日历视图。
- **Services**: 新增 `services/learning.ts` 或扩展现有统计服务。
