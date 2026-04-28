## Context

C04-C05 已完成题库、卷册、章节的管理。本题库的题目需要挂到 `bank_sections` 下，通过 `section_id` 关联。题目有 4 种类型（单选/多选/判断/填空），选项和答案存为 JSONB 以灵活适配不同题型。

## Goals / Non-Goals

**Goals:**

- 管理员可以在题库下逐题创建/编辑题目
- 支持单选/多选/判断/填空 4 种题型，每种题型有对应的表单 UI
- 支持通过 JSON 批量导入题目，带预览和校验
- 题目列表支持分页和按章节/类型/难度筛选
- 导入后自动更新章节的 `question_count`

**Non-Goals:**

- 不实现 Excel 导入（初期只用 JSON，后续可加）
- 不实现题目图片/公式渲染（纯文本）
- 不实现题目审核流程（直接发布）
- 不实现题目随机组卷（属于 C07 模考管理）

## Decisions

### 1. JSONB 存储选项和答案

**选择**: `options` 和 `correct_answer` 使用 JSONB

**理由**:
- 不同题型结构不同：单选/多选有选项列表，判断题是 T/F，填空题是文本
- JSONB 灵活存储，PostgreSQL 原生支持 JSON 查询
- 具体格式约定：
  - 单选: `options: [{label: "A", text: "..."}, ...]`, `correct_answer: "A"`
  - 多选: `options: [{label: "A", text: "..."}, ...]`, `correct_answer: ["A", "C"]`
  - 判断: `options: null`, `correct_answer: "T"` 或 `"F"`
  - 填空: `options: null`, `correct_answer: "答案文本"`

### 2. 批量导入方式

**选择**: 前端粘贴 JSON → 预览校验 → 确认后发送到后端

**理由**:
- 不需要文件上传，避免引入文件解析依赖
- 粘贴 JSON 可以直接从其他系统导出后粘贴
- 预览让管理员确认数据正确性后再导入
- 单次限制 500 题以内

### 3. 题目编辑页面

**选择**: 独立页面 `/banks/:bankId/questions/new` 和 `/questions/:questionId/edit`

**理由**:
- 题目表单较复杂（题干、选项、答案、解析、难度等），弹窗空间不够
- 与题库编辑页风格一致

### 4. question_count 更新策略

**选择**: 导入/创建题目后，用 SQL `COUNT` 刷新对应 section 的 `question_count`

**理由**: 简单可靠，数据量不大时性能无问题。不用触发器避免复杂度。

## Risks / Trade-offs

- **[JSON 格式多样性]** 不同题型 JSON 格式需前端严格按约定处理 → 后端 Zod 校验确保格式正确。
- **[批量导入规模]** 单次导入大量题目可能导致请求超时 → 限制单次 500 题，超出提示分批导入。
