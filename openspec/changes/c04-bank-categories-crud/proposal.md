## Why

题库分类和题库是整个内容管理系统的入口。管理员需要先创建分类（如"会计"、"建筑"、"医学"），再在分类下创建题库，后续的卷册、章节、题目都挂在题库之下。这是 P1 阶段的第一个 Change，为后续 C05（卷册/章节）和 C06（题目管理）提供基础。

## What Changes

- 新增 `bank_categories` 和 `question_banks` 两张表的 Drizzle schema 和 migration
- Admin API: 分类 CRUD (`/api/admin/v1/bank-categories`)
- Admin API: 题库 CRUD (`/api/admin/v1/banks`)，包含分页、筛选
- Admin 页面: 分类管理页（列表 + 新增/编辑弹窗）
- Admin 页面: 题库列表页（表格 + 分页 + 状态筛选）
- Admin 页面: 题库新增/编辑页（表单：名称、分类、封面、描述、排序等）
- 题库状态管理: `draft` → `published` → `archived`

## Capabilities

### New Capabilities

- `admin-bank-categories`: 题库分类管理 — 分类 CRUD API + 管理页面（列表、新增、编辑、排序、显示/隐藏）
- `admin-question-banks`: 题库管理 — 题库 CRUD API + 管理页面（列表、新增、编辑、状态切换、归档）

### Modified Capabilities

（无现有 capability 需要修改）

## Impact

- **数据库**: 新增 `bank_categories`、`question_banks` 两张表
- **新增依赖**: 可能需要 `zod`（请求校验）
- **新增 API**: 8 个 admin 端点
- **新增页面**: 3 个管理页面
- **导航**: 侧边栏"题库管理"菜单项指向新页面
