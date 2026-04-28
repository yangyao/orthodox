## 1. Schema 与 Migration

- [x] 1.1 创建 `src/lib/schema/questions.ts`：定义 `questions` 表的 Drizzle schema（bank_id FK, section_id FK, JSONB options/correct_answer, 索引）
- [x] 1.2 更新 `src/lib/schema/index.ts`：添加 questions 的 barrel export
- [x] 1.3 运行 `npm run db:generate` 和 `npm run db:migrate` 创建新表和索引

## 2. 题目列表 API

- [x] 2.1 创建 `GET /api/admin/v1/banks/[bankId]/questions`：题目列表（分页 + sectionId/questionType/difficulty/keyword 筛选，含 section title）

## 3. 单题创建/更新 API

- [x] 3.1 创建 `POST /api/admin/v1/banks/[bankId]/questions`：新增题目（Zod 校验，按题型校验 options/answer 格式，更新 section question_count）
- [x] 3.2 创建 `PATCH /api/admin/v1/questions/[questionId]`：更新题目

## 4. 批量导入 API

- [x] 4.1 创建 `POST /api/admin/v1/banks/[bankId]/questions/import`：JSON 批量导入（校验、批量插入、更新 question_count，限制 500 题）

## 5. 题目列表页面

- [x] 5.1 创建 `src/app/(dashboard)/banks/[bankId]/questions/page.tsx`：题目列表页（分页表格 + 筛选 + "新增题目"和"批量导入"按钮）
- [x] 5.2 修改卷册管理页 `src/app/(dashboard)/banks/[bankId]/editions/page.tsx`：增加"题目"入口按钮

## 6. 单题编辑页面

- [x] 6.1 创建 `src/components/questions/question-form.tsx`：动态题目表单组件（按题型切换 UI：单选/多选有选项列表，判断有正确/错误，填空有文本输入）
- [x] 6.2 创建 `src/app/(dashboard)/banks/[bankId]/questions/new/page.tsx`：新增题目页
- [x] 6.3 创建 `src/app/(dashboard)/questions/[questionId]/edit/page.tsx`：编辑题目页

## 7. 批量导入页面

- [x] 7.1 创建 `src/app/(dashboard)/banks/[bankId]/questions/import/page.tsx`：导入页（JSON 文本框 + 预览表格 + 校验状态 + 确认导入按钮）

## 8. 验证

- [x] 8.1 `npm run build` 验证通过
