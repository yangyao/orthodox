## Why

题目是刷题系统的核心数据。管理员需要将题目录入系统，挂载到卷册的章节下，供用户练习。本 Change 实现题目管理的完整闭环：逐题添加、批量导入、列表查看和编辑，是内容管理的最后一个核心环节。

## What Changes

- 新增 `questions` 表的 Drizzle schema 和 migration（含索引）
- Admin API: 题目列表（分页 + 按章节/类型/难度/状态筛选）
- Admin API: 单题创建和更新
- Admin API: JSON 批量导入（上传 → 校验 → 批量插入）
- Admin 页面: 题目列表页（表格 + 分页 + 筛选）
- Admin 页面: 单题编辑页（支持 4 种题型：单选/多选/判断/填空）
- Admin 页面: 批量导入页（粘贴 JSON → 预览 → 确认导入）
- 导入后自动更新对应章节的 `question_count`

## Capabilities

### New Capabilities

- `admin-question-list`: 题目列表 — 分页列表 API + 管理页面（按章节/类型/难度/状态筛选）
- `admin-question-edit`: 题目编辑 — 单题创建/更新 API + 编辑页面（4 种题型的动态表单）
- `admin-question-import`: 题目批量导入 — JSON 导入 API + 导入页面（预览 + 校验 + 确认）

### Modified Capabilities

（无现有 capability 需要修改）

## Impact

- **数据库**: 新增 `questions` 表 + 索引
- **新增 API**: 4 个 admin 端点（列表、创建、更新、导入）
- **新增页面**: 题目列表页、单题编辑页、批量导入页
- **数据变更**: 导入后更新 `bank_sections.question_count`
