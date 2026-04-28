## Why

题库需要卷册（如"2025 版"、"2026 版"）和章节（如"第一章 总论"、"第二节 会计要素"）两级结构来组织题目。卷册是题库的版本维度，章节是内容的层级目录。管理员在创建题库后（C04），需要进一步管理卷册和章节树，才能在 C06 中将题目挂载到具体章节下。

## What Changes

- 新增 `bank_editions` 和 `bank_sections` 两张表的 Drizzle schema 和 migration
- Admin API: 卷册 CRUD (`/api/admin/v1/banks/:bankId/editions`)
- Admin API: 章节 CRUD (`/api/admin/v1/editions/:editionId/sections`)，支持 `parent_id` 构建多层级树
- Admin 页面: 题库详情页中展示卷册列表（新增/编辑/删除）
- Admin 页面: 卷册下的章节树编辑器（树形展开、新增子章节、编辑、删除、排序）
- 章节的 `question_count` 字段预留，后续 C06 题目管理时自动更新

## Capabilities

### New Capabilities

- `admin-editions`: 卷册管理 — 卷册 CRUD API + 题库详情页内的卷册列表管理
- `admin-sections`: 章节树管理 — 章节 CRUD API + 树形编辑器（多层级、排序、试用标记）

### Modified Capabilities

（无现有 capability 需要修改）

## Impact

- **数据库**: 新增 `bank_editions`、`bank_sections` 两张表
- **新增 API**: 4 个 admin 端点（卷册 CRUD + 章节 CRUD）
- **新增页面**: 题库卷册管理页、章节树编辑页
- **修改页面**: 题库列表页增加"卷册"操作入口
