## 1. Schema 与 Migration

- [x] 1.1 创建 `src/lib/schema/bank-editions.ts`：定义 `bank_editions` 表的 Drizzle schema（bank_id FK + CASCADE）
- [x] 1.2 创建 `src/lib/schema/bank-sections.ts`：定义 `bank_sections` 表的 Drizzle schema（edition_id FK + CASCADE, parent_id 自引用）
- [x] 1.3 更新 `src/lib/schema/index.ts`：添加新表的 barrel export
- [x] 1.4 运行 `npm run db:generate` 和 `npm run db:migrate` 创建新表

## 2. 卷册 API

- [x] 2.1 创建 `GET /api/admin/v1/banks/[bankId]/editions`：列出题库下所有卷册（按 sort_order）
- [x] 2.2 创建 `POST /api/admin/v1/banks/[bankId]/editions`：新增卷册（Zod 校验 name）
- [x] 2.3 创建 `PATCH /api/admin/v1/editions/[editionId]`：更新卷册
- [x] 2.4 创建 `DELETE /api/admin/v1/editions/[editionId]`：删除卷册（CASCADE 删章节）

## 3. 章节 API

- [x] 3.1 创建 `GET /api/admin/v1/editions/[editionId]/sections`：列出卷册下所有章节（flat list，按 sort_order）
- [x] 3.2 创建 `POST /api/admin/v1/editions/[editionId]/sections`：新增章节（支持 parentId）
- [x] 3.3 创建 `PATCH /api/admin/v1/sections/[sectionId]`：更新章节
- [x] 3.4 创建 `DELETE /api/admin/v1/sections/[sectionId]`：删除章节（有子章节时拒绝）

## 4. 卷册管理页面

- [x] 4.1 创建 `src/app/(dashboard)/banks/[bankId]/editions/page.tsx`：卷册列表页（显示题库名称、卷册表格、新增/编辑/删除操作、"章节"入口按钮）
- [x] 4.2 修改题库列表页 `src/app/(dashboard)/banks/page.tsx`：操作列增加"卷册"按钮

## 5. 章节树编辑页面

- [x] 5.1 创建 `src/components/sections/section-tree.tsx`：递归树形组件（缩进、展开/折叠、操作按钮、新增子章节内联表单）
- [x] 5.2 创建 `src/app/(dashboard)/editions/[editionId]/sections/page.tsx`：章节树编辑页（显示卷册名称、加载全量章节、前端组装树、调用树组件）

## 6. 验证

- [x] 6.1 `npm run build` 验证通过
