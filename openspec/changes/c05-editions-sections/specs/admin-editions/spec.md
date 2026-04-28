## ADDED Requirements

### Requirement: bank_editions table schema

The system SHALL define a `bank_editions` table with columns: `id` (bigserial PK), `bank_id` (bigint FK to question_banks with CASCADE delete), `name` (varchar 128), `version_label` (varchar 64), `sort_order` (int, default 0), `is_trial` (boolean, default false), `is_active` (boolean, default true).

#### Scenario: Migration creates bank_editions table

- **WHEN** running `npm run db:migrate`
- **THEN** the `bank_editions` table SHALL be created with a foreign key to `question_banks(id)` with `ON DELETE CASCADE`

### Requirement: List editions for a bank

The system SHALL provide `GET /api/admin/v1/banks/:bankId/editions` returning all editions for a bank ordered by `sort_order`.

#### Scenario: List editions

- **WHEN** sending GET to `/api/admin/v1/banks/1/editions`
- **THEN** the API SHALL return an array of editions with all columns, ordered by `sort_order`

### Requirement: Create edition

The system SHALL provide `POST /api/admin/v1/banks/:bankId/editions` accepting `name`, `versionLabel`, `sortOrder`, `isTrial`, `isActive`.

#### Scenario: Create edition with valid data

- **WHEN** sending POST with `{ "name": "2025 版", "versionLabel": "v2025.1" }`
- **THEN** the API SHALL create the edition linked to bank 1 and return the created record

#### Scenario: Create edition with missing name

- **WHEN** sending POST without `name`
- **THEN** the API SHALL return a validation error with status 400

### Requirement: Update edition

The system SHALL provide `PATCH /api/admin/v1/editions/:editionId` accepting partial updates.

#### Scenario: Update edition name

- **WHEN** sending PATCH to `/api/admin/v1/editions/1` with `{ "name": "2026 版" }`
- **THEN** the API SHALL update only the name and return the updated record

### Requirement: Delete edition

The system SHALL provide `DELETE /api/admin/v1/editions/:editionId` which cascades deletes all associated sections.

#### Scenario: Delete edition with sections

- **WHEN** sending DELETE to `/api/admin/v1/editions/1`
- **THEN** the edition and all its sections SHALL be deleted

### Requirement: Editions management page

The system SHALL provide an editions management page at `/banks/:bankId/editions` displaying a table of editions with add, edit, and delete actions.

#### Scenario: Editions page renders

- **WHEN** navigating to `/banks/1/editions`
- **THEN** the page SHALL display the bank name as header and a table with columns: 名称, 版本标签, 排序, 试用, 状态, 操作, and a "新增卷册" button

#### Scenario: Bank list links to editions

- **WHEN** viewing the bank list page at `/banks`
- **THEN** each row SHALL have a "卷册" action button linking to `/banks/:bankId/editions`
