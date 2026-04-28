## 1. Schema 与 Migration

- [x] 1.1 创建 `src/lib/schema/bank-categories.ts`：定义 `bank_categories` 表的 Drizzle schema
- [x] 1.2 创建 `src/lib/schema/question-banks.ts`：定义 `question_banks` 表的 Drizzle schema
- [x] 1.3 更新 `src/lib/schema/index.ts`：添加新表的 barrel export
- [x] 1.4 运行 `npm run db:generate` 和 `npm run db:migrate` 创建新表

## 2. Zod 校验与工具

- [x] 2.1 安装 `zod` 依赖
- [x] 2.2 创建 `src/lib/api-utils.ts`：统一响应格式封装（success/error）、Zod 校验 helper、分页参数解析

## 3. 分类 API

- [x] 3.1 创建 `GET /api/admin/v1/bank-categories`：返回所有分类（按 sort_order 排序）
- [x] 3.2 创建 `POST /api/admin/v1/bank-categories`：新增分类（Zod 校验 code/name）
- [x] 3.3 创建 `PATCH /api/admin/v1/bank-categories/[id]`：更新分类
- [x] 3.4 创建 `DELETE /api/admin/v1/bank-categories/[id]`：删除分类（检查是否有关联题库）

## 4. 题库 API

- [x] 4.1 创建 `GET /api/admin/v1/banks`：题库列表（分页 + status/categoryId/keyword 筛选）
- [x] 4.2 创建 `POST /api/admin/v1/banks`：新增题库（Zod 校验）
- [x] 4.3 创建 `GET /api/admin/v1/banks/[bankId]`：题库详情（含分类名称）
- [x] 4.4 创建 `PATCH /api/admin/v1/banks/[bankId]`：更新题库
- [x] 4.5 创建 `DELETE /api/admin/v1/banks/[bankId]`：归档题库（status → archived）

## 5. 分类管理页面

- [x] 5.1 创建 `src/app/(dashboard)/bank-categories/page.tsx`：分类列表页（表格 + 新增/编辑弹窗 + 删除确认）
- [x] 5.2 创建分类表单弹窗组件 `src/components/bank-categories/category-dialog.tsx`

## 6. 题库管理页面

- [x] 6.1 创建 `src/app/(dashboard)/banks/page.tsx`：题库列表页（表格 + 分页 + 状态筛选 + 关键词搜索）
- [x] 6.2 创建 `src/app/(dashboard)/banks/new/page.tsx`：新增题库表单页
- [x] 6.3 创建 `src/app/(dashboard)/banks/[bankId]/edit/page.tsx`：编辑题库表单页
- [x] 6.4 创建题库表单组件 `src/components/banks/bank-form.tsx`（新增/编辑复用）

## 7. 验证

- [x] 7.1 `npm run build` 验证通过
