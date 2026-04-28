## 1. Schema 与 Migration

- [x] 1.1 创建 `src/lib/schema/mock-papers.ts`：定义 `mock_papers` 和 `mock_paper_questions` 表的 Drizzle schema
- [x] 1.2 更新 `src/lib/schema/index.ts`：添加 mock-papers 的 barrel export
- [x] 1.3 运行 `npm run db:generate` 和 `npm run db:migrate` 创建新表

## 2. 模考试卷 CRUD API

- [x] 2.1 创建 `GET /api/admin/v1/banks/[bankId]/mock-papers`：模考列表（分页 + status/keyword 筛选）
- [x] 2.2 创建 `POST /api/admin/v1/banks/[bankId]/mock-papers`：创建试卷
- [x] 2.3 创建 `GET /api/admin/v1/mock-papers/[paperId]`：试卷详情（含题目列表）
- [x] 2.4 创建 `PATCH /api/admin/v1/mock-papers/[paperId]`：更新试卷基本信息
- [x] 2.5 创建 `DELETE /api/admin/v1/mock-papers/[paperId]`：删除试卷

## 3. 组卷 API（题目管理）

- [x] 3.1 创建 `POST /api/admin/v1/mock-papers/[paperId]/questions`：批量添加题目到试卷
- [x] 3.2 创建 `DELETE /api/admin/v1/mock-papers/[paperId]/questions/[questionId]`：移除试卷题目
- [x] 3.3 创建 `PATCH /api/admin/v1/mock-papers/[paperId]/questions/[questionId]`：更新题目分值/排序
- [x] 3.4 创建 `POST /api/admin/v1/mock-papers/[paperId]/draw`：随机抽题（排除已有题目）

## 4. 模考列表页面

- [ ] 4.1 创建 `src/app/(dashboard)/banks/[bankId]/mock-papers/page.tsx`：模考列表页（分页表格 + 筛选 + "新建试卷"按钮）
- [ ] 4.2 修改题库管理页或 editions 页，增加"模考"入口按钮

## 5. 组卷编辑页面

- [x] 5.1 创建 `src/app/(dashboard)/banks/[bankId]/mock-papers/[paperId]/edit/page.tsx`：组卷编辑页（试卷信息 + 已选题目列表 + 选题工具）
- [ ] 5.2 创建 `src/components/mock-papers/question-picker.tsx`：手动选题组件（搜索/筛选 + 选择添加）
- [ ] 5.3 创建 `src/components/mock-papers/random-draw.tsx`：随机抽题组件（条件设置 + 预览 + 确认）

## 6. 验证

- [x] 6.1 `npm run build` 验证通过
