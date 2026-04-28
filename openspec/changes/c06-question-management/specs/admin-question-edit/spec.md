## ADDED Requirements

### Requirement: Create single question API

The system SHALL provide `POST /api/admin/v1/banks/:bankId/questions` accepting `sectionId`, `questionType` (single/multi/judge/fill), `stem`, `options`, `correctAnswer`, `explanation`, `difficulty`, `sourceLabel`, `sortOrder`.

#### Scenario: Create single-choice question

- **WHEN** sending POST with `{ "questionType": "single", "stem": "问题", "options": [{"label":"A","text":"选项A"},{"label":"B","text":"选项B"}], "correctAnswer": "A" }`
- **THEN** the API SHALL create the question and return the created record

#### Scenario: Create fill-in-the-blank question

- **WHEN** sending POST with `{ "questionType": "fill", "stem": "___是中国的首都", "correctAnswer": "北京" }`
- **THEN** the API SHALL create the question with null options

#### Scenario: Missing required fields

- **WHEN** sending POST without `stem` or `correctAnswer`
- **THEN** the API SHALL return a validation error with status 400

### Requirement: Update question API

The system SHALL provide `PATCH /api/admin/v1/questions/:questionId` accepting partial updates to any question field.

#### Scenario: Update question stem and explanation

- **WHEN** sending PATCH with `{ "stem": "新题干", "explanation": "新解析" }`
- **THEN** the API SHALL update only those fields

### Requirement: Question create page with dynamic form

The system SHALL provide a create page at `/banks/:bankId/questions/new` with a dynamic form that changes based on the selected question type.

#### Scenario: Single-choice form

- **WHEN** selecting question type "single" (单选)
- **THEN** the form SHALL display: stem textarea, dynamic options list (add/remove options with label A/B/C/D + text input), correct answer radio selection, explanation textarea, difficulty select, section select

#### Scenario: Multi-choice form

- **WHEN** selecting question type "multi" (多选)
- **THEN** the form SHALL display the same as single-choice but with checkbox selection for correct answers (multiple selections allowed)

#### Scenario: Judge form

- **WHEN** selecting question type "judge" (判断)
- **THEN** the form SHALL display: stem textarea, correct answer radio (正确/错误), explanation textarea, difficulty select, section select. No options input.

#### Scenario: Fill-in-the-blank form

- **WHEN** selecting question type "fill" (填空)
- **THEN** the form SHALL display: stem textarea, correct answer text input, explanation textarea, difficulty select, section select. No options input.

### Requirement: Question edit page

The system SHALL provide an edit page at `/questions/:questionId/edit` pre-filled with the question's current values.

#### Scenario: Edit existing question

- **WHEN** navigating to `/questions/1/edit`
- **THEN** the form SHALL be pre-filled with all current values and the question type SHALL be disabled (cannot change type after creation)

#### Scenario: Submit updates question

- **WHEN** submitting the edit form with modified data
- **THEN** the question SHALL be updated and the page SHALL redirect to the question list

### Requirement: Section question_count auto-update on create

The system SHALL increment the `question_count` of the associated `bank_sections` row when a question is created with a `sectionId`.

#### Scenario: Create question updates section count

- **WHEN** creating a question with `sectionId: 5`
- **THEN** the `question_count` of section 5 SHALL be incremented by 1
