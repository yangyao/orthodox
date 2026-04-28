## Capability: admin-mock-paper-crud

模考试卷的增删改查管理。

### Requirements

#### REQ-1: Schema 与 Migration

- 定义 `mock_papers` 表的 Drizzle schema：
  - `id`: bigserial PK
  - `bank_id`: bigint FK → question_banks(id) ON DELETE CASCADE
  - `title`: varchar(255) NOT NULL
  - `paper_year`: integer（可选，如 113、114）
  - `total_questions`: integer NOT NULL default 0
  - `total_score`: integer NOT NULL default 0
  - `passing_score`: integer（可选）
  - `duration_minutes`: integer NOT NULL
  - `status`: varchar(16) NOT NULL default 'draft'（draft/published/archived）
  - `created_at`: timestamptz
  - `updated_at`: timestamptz
- 定义 `mock_paper_questions` 表的 Drizzle schema：
  - `paper_id`: bigint FK → mock_papers(id) ON DELETE CASCADE
  - `question_id`: bigint FK → questions(id)
  - `sort_order`: integer NOT NULL
  - `score`: numeric(8,2) NOT NULL default 1
  - PRIMARY KEY (paper_id, question_id)
- 生成并运行 migration

#### REQ-2: 模考列表 API

- `GET /api/admin/v1/banks/:bankId/mock-papers`
- 分页 + bankId 筛选 + status 筛选 + keyword 模糊搜索 title
- 返回：id, title, paperYear, totalQuestions, totalScore, passingScore, durationMinutes, status, createdAt
- 按 createdAt 降序

#### REQ-3: 创建试卷 API

- `POST /api/admin/v1/banks/:bankId/mock-papers`
- Zod 校验：title (required), paperYear (optional), durationMinutes (required, ≥1), passingScore (optional), status (draft/published)
- 创建后返回完整试卷数据

#### REQ-4: 试卷详情 API

- `GET /api/admin/v1/mock-papers/:paperId`
- 返回试卷基本信息 + 关联的题目列表（含 question stem, type, options）
- 题目按 sort_order 排序

#### REQ-5: 更新试卷 API

- `PATCH /api/admin/v1/mock-papers/:paperId`
- 可更新：title, paperYear, durationMinutes, passingScore, status
- 更新 updatedAt

#### REQ-6: 删除试卷 API

- `DELETE /api/admin/v1/mock-papers/:paperId`
- 级联删除 mock_paper_questions（由 FK ON DELETE CASCADE 处理）

#### REQ-7: 模考列表页面

- 路由：`/banks/:bankId/mock-papers`
- 显示表格：标题、年份、题数、总分、时长、状态、操作
- 操作：查看/编辑（跳转组卷页）、删除（确认弹窗）
- "新建试卷"按钮
- 题库管理页面添加"模考"入口按钮

### Acceptance Criteria

- 可以创建/查看/编辑/删除模考试卷
- 列表支持分页和按状态筛选
- 试卷详情包含完整题目列表
