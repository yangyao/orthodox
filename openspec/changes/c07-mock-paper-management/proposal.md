## Why

模考是刷题系统的核心学习功能。管理员需要创建模考试卷（设置时长/分数/选题），用户才能在前端进行模拟考试。本 Change 实现管理端的模考试卷管理，为后续小程序端模考做题（C13-C14）提供数据基础。

## What Changes

- 新增 `mock_papers` 和 `mock_paper_questions` 表的 Drizzle schema 和 migration
- Admin API: 模考试卷 CRUD（创建/读取/更新/删除）
- Admin API: 组卷功能 — 手动选题 + 按章节/难度随机抽题
- Admin API: 模考试卷详情（含题目列表）
- Admin 页面: 模考列表页（按题库筛选）
- Admin 页面: 组卷编辑页（设置时长/分数/及格线，选题或随机抽题）

## Capabilities

### New Capabilities

- `admin-mock-paper-crud`: 模考试卷 CRUD — 创建/读取/更新/删除试卷 API + 列表页
- `admin-mock-paper-compose`: 组卷功能 — 手动选题 + 随机抽题 API + 组卷编辑页

### Modified Capabilities

（无现有 capability 需要修改）

## Impact

- **数据库**: 新增 `mock_papers` + `mock_paper_questions` 表
- **新增 API**: 5 个 admin 端点（列表、创建、详情、更新、删除试卷；选题/抽题）
- **新增页面**: 模考列表页、组卷编辑页
- **依赖**: 依赖 C06 的 `questions` 表和选题功能
