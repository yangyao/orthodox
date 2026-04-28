## ADDED Requirements

### Requirement: question_banks table schema

The system SHALL define a `question_banks` table with columns: `id` (bigserial PK), `category_id` (bigint FK to bank_categories), `code` (varchar 64, unique), `name` (varchar 128), `subtitle` (varchar 255), `cover_url` (text), `description` (text), `status` (varchar 16, default 'draft'), `sale_type` (varchar 16, default 'paid'), `default_valid_days` (int), `sort_order` (int, default 0), `is_recommended` (boolean, default false), `created_at`, `updated_at`.

#### Scenario: Migration creates question_banks table

- **WHEN** running `npm run db:migrate`
- **THEN** the `question_banks` table SHALL be created with a foreign key to `bank_categories(id)` and `code` having a unique constraint

### Requirement: Bank list API with pagination and filtering

The system SHALL provide `GET /api/admin/v1/banks` returning paginated banks, supporting query parameters `page`, `pageSize`, `status`, `categoryId`, and `keyword` (search by name).

#### Scenario: List banks with default pagination

- **WHEN** sending GET to `/api/admin/v1/banks`
- **THEN** the API SHALL return the first 20 banks with pagination metadata (items, page, pageSize, total)

#### Scenario: Filter by status

- **WHEN** sending GET to `/api/admin/v1/banks?status=published`
- **THEN** the API SHALL return only banks with status "published"

#### Scenario: Search by keyword

- **WHEN** sending GET to `/api/admin/v1/banks?keyword=会计`
- **THEN** the API SHALL return only banks whose name contains "会计"

#### Scenario: Filter by category

- **WHEN** sending GET to `/api/admin/v1/banks?categoryId=1`
- **THEN** the API SHALL return only banks belonging to category 1

### Requirement: Create bank API

The system SHALL provide `POST /api/admin/v1/banks` accepting `categoryId`, `code`, `name`, `subtitle`, `coverUrl`, `description`, `saleType`, `defaultValidDays`, `sortOrder`, `isRecommended`.

#### Scenario: Create bank with valid data

- **WHEN** sending POST with required fields `categoryId`, `code`, `name`
- **THEN** the API SHALL create a bank with status "draft" and return the created record

#### Scenario: Create bank with duplicate code

- **WHEN** sending POST with a `code` that already exists
- **THEN** the API SHALL return an error with status 409

### Requirement: Get bank detail API

The system SHALL provide `GET /api/admin/v1/banks/:bankId` returning the full bank record including category name.

#### Scenario: Get existing bank

- **WHEN** sending GET to `/api/admin/v1/banks/1`
- **THEN** the API SHALL return the bank record with `id`, `code`, `name`, `subtitle`, `coverUrl`, `description`, `status`, `saleType`, `defaultValidDays`, `sortOrder`, `isRecommended`, `categoryName`, `createdAt`, `updatedAt`

#### Scenario: Get non-existent bank

- **WHEN** sending GET to `/api/admin/v1/banks/99999`
- **THEN** the API SHALL return 404

### Requirement: Update bank API

The system SHALL provide `PATCH /api/admin/v1/banks/:bankId` accepting partial updates to any bank field except `code`.

#### Scenario: Update bank name

- **WHEN** sending PATCH with `{ "name": "初级会计实务" }`
- **THEN** the API SHALL update only the name and return the updated record

### Requirement: Archive bank (soft delete)

The system SHALL provide `DELETE /api/admin/v1/banks/:bankId` which sets the bank status to "archived" instead of deleting the record.

#### Scenario: Archive a draft bank

- **WHEN** sending DELETE for a bank with status "draft"
- **THEN** the API SHALL set the bank's status to "archived" and return the updated record

### Requirement: Bank list page

The system SHALL provide a bank list page at `/banks` displaying all banks in a paginated table with status filter and keyword search.

#### Scenario: Bank list page renders

- **WHEN** navigating to `/banks`
- **THEN** the page SHALL display a table with columns: 名称, 分类, 状态, 售卖类型, 排序, 创建时间, 操作, and filters for status and keyword search, and a "新增题库" button

#### Scenario: Pagination works

- **WHEN** clicking page 2 in the pagination
- **THEN** the table SHALL load the next page of banks

### Requirement: Bank create/edit page

The system SHALL provide a bank form page at `/banks/new` and `/banks/:bankId/edit` with all bank fields.

#### Scenario: Create new bank page

- **WHEN** navigating to `/banks/new`
- **THEN** the page SHALL display a form with fields: 分类 (select), 编码, 名称, 副标题, 封面 URL, 描述, 售卖类型, 有效天数, 排序, 是否推荐, and a "创建" submit button

#### Scenario: Edit existing bank page

- **WHEN** navigating to `/banks/1/edit`
- **THEN** the page SHALL display the same form pre-filled with the bank's current values, with a "保存" submit button

#### Scenario: Submit creates bank

- **WHEN** submitting the form at `/banks/new` with valid data
- **THEN** the bank SHALL be created and the page SHALL redirect to `/banks`

#### Scenario: Submit updates bank

- **WHEN** submitting the form at `/banks/1/edit` with valid data
- **THEN** the bank SHALL be updated and the page SHALL redirect to `/banks`
