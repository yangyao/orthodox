## ADDED Requirements

### Requirement: bank_categories table schema

The system SHALL define a `bank_categories` table with columns: `id` (bigserial PK), `code` (varchar 32, unique), `name` (varchar 64), `sort_order` (int, default 0), `is_visible` (boolean, default true).

#### Scenario: Migration creates bank_categories table

- **WHEN** running `npm run db:migrate`
- **THEN** the `bank_categories` table SHALL be created with `code` having a unique constraint

### Requirement: Category list API

The system SHALL provide `GET /api/admin/v1/bank-categories` returning all categories ordered by `sort_order`.

#### Scenario: List categories

- **WHEN** sending GET to `/api/admin/v1/bank-categories`
- **THEN** the API SHALL return an array of categories with `id`, `code`, `name`, `sort_order`, `is_visible` in the unified response format

### Requirement: Create category API

The system SHALL provide `POST /api/admin/v1/bank-categories` accepting `code`, `name`, `sort_order`, `is_visible`.

#### Scenario: Create category with valid data

- **WHEN** sending POST with `{ "code": "accounting", "name": "会计", "sortOrder": 1 }`
- **THEN** the API SHALL create the category and return the created record with status 201

#### Scenario: Create category with duplicate code

- **WHEN** sending POST with a `code` that already exists
- **THEN** the API SHALL return an error with status 409

#### Scenario: Create category with missing required fields

- **WHEN** sending POST without `code` or `name`
- **THEN** the API SHALL return a validation error with status 400

### Requirement: Update category API

The system SHALL provide `PATCH /api/admin/v1/bank-categories/:id` accepting partial updates to `name`, `sort_order`, `is_visible`.

#### Scenario: Update category name

- **WHEN** sending PATCH with `{ "name": "会计类" }`
- **THEN** the API SHALL update only the name and return the updated record

### Requirement: Delete category API

The system SHALL provide `DELETE /api/admin/v1/bank-categories/:id`.

#### Scenario: Delete category with no associated banks

- **WHEN** sending DELETE for a category that has no associated question banks
- **THEN** the API SHALL delete the category and return status 200

#### Scenario: Delete category with associated banks

- **WHEN** sending DELETE for a category that has associated question banks
- **THEN** the API SHALL return an error with status 409 and a message indicating the category is in use

### Requirement: Category management page

The system SHALL provide a category management page at `/bank-categories` displaying all categories in a sortable table with actions to add, edit, and delete.

#### Scenario: Category page displays table

- **WHEN** navigating to `/bank-categories`
- **THEN** the page SHALL display a table with columns: 排序, 编码, 名称, 显示, 操作 and an "新增分类" button

#### Scenario: Add category via dialog

- **WHEN** clicking "新增分类"
- **THEN** a dialog SHALL appear with form fields for code, name, sort_order, and is_visible

#### Scenario: Edit category via dialog

- **WHEN** clicking the edit action on a category row
- **THEN** a dialog SHALL appear pre-filled with the category's current values
