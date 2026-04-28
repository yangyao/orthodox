## Capability: admin-mock-paper-compose

组卷功能 — 手动选题和随机抽题。

### Requirements

#### REQ-1: 添加题目到试卷 API

- `POST /api/admin/v1/mock-papers/:paperId/questions`
- Body: `{ items: [{ questionId: number, score?: number, sortOrder?: number }] }`
- Zod 校验 items 数组，每项必须有 questionId
- 检查 questionId 是否属于该试卷的题库
- 防止重复添加（复合主键天然防重，重复时跳过或报错）
- 插入后刷新试卷的 `total_questions` 和 `total_score`

#### REQ-2: 移除试卷题目 API

- `DELETE /api/admin/v1/mock-papers/:paperId/questions/:questionId`
- 删除后刷新试卷的 `total_questions` 和 `total_score`

#### REQ-3: 更新试卷题目 API

- `PATCH /api/admin/v1/mock-papers/:paperId/questions/:questionId`
- 可更新：score, sortOrder
- 用于调整分值和排序

#### REQ-4: 随机抽题 API

- `POST /api/admin/v1/mock-papers/:paperId/draw`
- Body: `{ sectionId?: number, questionType?: string, difficulty?: number, count: number }`
- count 必填，≥ 1，≤ 200
- 从试卷所属题库中随机抽取符合条件的题目
- 排除已在试卷中的题目
- 返回抽中的题目列表（不自动添加，需管理员确认）
- 如果可用题目不足，返回实际可抽数量 + 提示

#### REQ-5: 刷新试卷统计

- 任何增删题目操作后，自动更新 `mock_papers.total_questions` 和 `mock_papers.total_score`
- total_questions = 该试卷的 mock_paper_questions 记录数
- total_score = 该试卷所有题目 score 之和

#### REQ-6: 组卷编辑页面

- 路由：`/banks/:bankId/mock-papers/:paperId/edit`
- 顶部：试卷基本信息编辑（标题、时长、及格线）
- 中部：已选题目列表（表格显示题号、题干、题型、分值、操作）
  - 支持修改分值（inline input）
  - 支持移除题目
- 底部：选题工具区域
  - Tab 1 — 手动选题：题目搜索/筛选（章节/类型/难度）+ 选择添加
  - Tab 2 — 随机抽题：设置条件（章节/类型/难度/数量）+ 预览抽题结果 + 确认添加
- 预览抽题结果展示在确认前

### Acceptance Criteria

- 可以手动从题库中选择题目添加到试卷
- 可以按条件随机抽取题目
- 已选题目可以调整分值和排序
- 可以从试卷中移除题目
- 题目增删后试卷 total_questions 和 total_score 自动更新
