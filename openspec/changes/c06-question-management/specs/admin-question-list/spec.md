## ADDED Requirements

### Requirement: questions table schema

The system SHALL define a `questions` table with columns: `id` (bigserial PK), `bank_id` (bigint FK to question_banks), `section_id` (bigint FK to bank_sections, nullable), `question_type` (varchar 16, not null), `stem` (text, not null), `options` (JSONB), `correct_answer` (JSONB, not null), `explanation` (text), `difficulty` (smallint, default 1), `source_label` (varchar 128), `sort_order` (int, default 0), `status` (varchar 16, default 'published'), `created_at`, `updated_at`. An index SHALL be created on `(bank_id, section_id, sort_order)`.

#### Scenario: Migration creates questions table with index

- **WHEN** running `npm run db:migrate`
- **THEN** the `questions` table SHALL be created with all columns, a foreign key to `question_banks(id)`, a foreign key to `bank_sections(id)`, and an index on `(bank_id, section_id, sort_order)`

### Requirement: Question list API with pagination and filtering

The system SHALL provide `GET /api/admin/v1/banks/:bankId/questions` returning paginated questions, supporting `page`, `pageSize`, `sectionId`, `questionType`, `difficulty`, and `keyword` (search in stem) query parameters.

#### Scenario: List questions with default pagination

- **WHEN** sending GET to `/api/admin/v1/banks/1/questions`
- **THEN** the API SHALL return the first 20 questions with pagination metadata

#### Scenario: Filter by section

- **WHEN** sending GET to `/api/admin/v1/banks/1/questions?sectionId=5`
- **THEN** the API SHALL return only questions in section 5

#### Scenario: Filter by type and difficulty

- **WHEN** sending GET to `/api/admin/v1/banks/1/questions?questionType=single&difficulty=3`
- **THEN** the API SHALL return only single-choice questions with difficulty 3

#### Scenario: Search by keyword

- **WHEN** sending GET to `/api/admin/v1/banks/1/questions?keyword=增值税`
- **THEN** the API SHALL return questions whose stem contains "增值税"

### Requirement: Question list page

The system SHALL provide a question list page at `/banks/:bankId/questions` displaying questions in a paginated table with filters for section, type, and difficulty.

#### Scenario: Question list page renders

- **WHEN** navigating to `/banks/1/questions`
- **THEN** the page SHALL display the bank name as header, filters for section/type/difficulty/keyword, a table with columns: 序号, 题干, 类型, 难度, 章节, 操作, and buttons for "新增题目" and "批量导入"

#### Scenario: Bank editions page links to questions

- **WHEN** viewing the editions page or bank list
- **THEN** there SHALL be a path to navigate to the question list for a bank
