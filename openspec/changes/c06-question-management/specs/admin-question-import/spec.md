## ADDED Requirements

### Requirement: Batch import API via JSON

The system SHALL provide `POST /api/admin/v1/banks/:bankId/questions/import` accepting a JSON array of questions. Each item follows the same schema as single question creation. Maximum 500 items per request.

#### Scenario: Import valid JSON array

- **WHEN** sending POST with a JSON array of 10 valid question objects
- **THEN** the API SHALL create all 10 questions and return `{ created: 10, errors: [] }`

#### Scenario: Import with validation errors

- **WHEN** sending POST with some items missing required fields
- **THEN** the API SHALL return status 400 with `{ created: 0, errors: [{ index: 2, message: "stem is required" }, ...] }`

#### Scenario: Import exceeds limit

- **WHEN** sending POST with more than 500 items
- **THEN** the API SHALL return an error "单次导入不能超过 500 题"

### Requirement: Import page with preview

The system SHALL provide an import page at `/banks/:bankId/questions/import` with a JSON text area, preview table, and confirm button.

#### Scenario: Paste JSON and preview

- **WHEN** pasting a valid JSON array into the text area and clicking "预览"
- **THEN** the page SHALL display a preview table showing each question's type, stem (truncated), and whether it passed validation

#### Scenario: Preview shows validation errors

- **WHEN** pasting JSON with some invalid items and clicking "预览"
- **THEN** invalid items SHALL be highlighted with error messages in the preview

#### Scenario: Confirm import

- **WHEN** clicking "确认导入" after preview
- **THEN** the API SHALL be called and the page SHALL show a success message with the count of imported questions, then redirect to the question list

### Requirement: Section question_count batch update on import

The system SHALL update `question_count` for all affected sections after a batch import.

#### Scenario: Import updates multiple section counts

- **WHEN** importing questions that belong to sections 1, 2, and 3
- **THEN** the `question_count` for sections 1, 2, and 3 SHALL be recalculated to reflect the new total
