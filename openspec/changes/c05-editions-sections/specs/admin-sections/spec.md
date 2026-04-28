## ADDED Requirements

### Requirement: bank_sections table schema

The system SHALL define a `bank_sections` table with columns: `id` (bigserial PK), `edition_id` (bigint FK to bank_editions with CASCADE delete), `parent_id` (bigint FK to bank_sections, nullable), `title` (varchar 255), `section_type` (varchar 16, default 'chapter'), `sort_order` (int, default 0), `question_count` (int, default 0), `is_trial` (boolean, default false).

#### Scenario: Migration creates bank_sections table

- **WHEN** running `npm run db:migrate`
- **THEN** the `bank_sections` table SHALL be created with a foreign key to `bank_editions(id)` with `ON DELETE CASCADE` and a self-referencing foreign key `parent_id` to `bank_sections(id)`

### Requirement: List sections for an edition as tree

The system SHALL provide `GET /api/admin/v1/editions/:editionId/sections` returning all sections for an edition, ordered by `sort_order`, with the response structured as a flat list that the frontend can assemble into a tree using `parent_id`.

#### Scenario: List sections

- **WHEN** sending GET to `/api/admin/v1/editions/1/sections`
- **THEN** the API SHALL return an array of sections, each containing `id`, `editionId`, `parentId`, `title`, `sectionType`, `sortOrder`, `questionCount`, `isTrial`, ordered by `sort_order`

### Requirement: Create section

The system SHALL provide `POST /api/admin/v1/editions/:editionId/sections` accepting `title`, `parentId`, `sectionType`, `sortOrder`, `isTrial`.

#### Scenario: Create root-level section

- **WHEN** sending POST with `{ "title": "第一章 总论" }`
- **THEN** the API SHALL create a section with `parentId` null (root level)

#### Scenario: Create child section

- **WHEN** sending POST with `{ "title": "第一节 概述", "parentId": 1 }`
- **THEN** the API SHALL create a section with `parentId` set to 1

### Requirement: Update section

The system SHALL provide `PATCH /api/admin/v1/sections/:sectionId` accepting partial updates to `title`, `sectionType`, `sortOrder`, `isTrial`.

#### Scenario: Update section title

- **WHEN** sending PATCH to `/api/admin/v1/sections/1` with `{ "title": "第一章 绪论" }`
- **THEN** the API SHALL update the title

### Requirement: Delete section

The system SHALL provide `DELETE /api/admin/v1/sections/:sectionId`.

#### Scenario: Delete section with children

- **WHEN** deleting a section that has child sections
- **THEN** the API SHALL return an error indicating the section has children and cannot be deleted

#### Scenario: Delete leaf section

- **WHEN** deleting a section with no children
- **THEN** the API SHALL delete the section

### Requirement: Section tree editor page

The system SHALL provide a section tree editor page at `/editions/:editionId/sections` displaying sections in a collapsible tree structure with add, edit, and delete actions.

#### Scenario: Tree editor renders with hierarchy

- **WHEN** navigating to `/editions/1/sections`
- **THEN** the page SHALL display the edition name as header and all sections in a tree layout with indentation for child sections, expand/collapse toggles, and action buttons per node

#### Scenario: Add child section

- **WHEN** clicking "添加子章节" on a section node
- **THEN** an inline form SHALL appear below the node to input the new section title

#### Scenario: Editions page links to section tree

- **WHEN** viewing the editions page at `/banks/:bankId/editions`
- **THEN** each edition row SHALL have a "章节" action button linking to `/editions/:editionId/sections`
