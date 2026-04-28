## ADDED Requirements

### Requirement: users table schema

The system SHALL define a `users` table with columns: `id` (bigserial PK), `openid` (varchar 64, unique), `union_id` (varchar 64, nullable), `mobile` (varchar 32, nullable), `status` (varchar 16, default 'active'), `created_at`, `updated_at`.

#### Scenario: Migration creates users table

- **WHEN** running `npm run db:migrate`
- **THEN** the `users` table SHALL be created with all specified columns, and `openid` SHALL have a unique constraint

### Requirement: user_profiles table schema

The system SHALL define a `user_profiles` table with columns: `user_id` (bigint PK, references users with CASCADE delete), `nickname`, `avatar_url`, `gender`, `province`, `city`, `last_login_at`, `last_login_ip` (inet type).

#### Scenario: Migration creates user_profiles table

- **WHEN** running `npm run db:migrate`
- **THEN** the `user_profiles` table SHALL be created with a foreign key to `users(id)` with `ON DELETE CASCADE`

### Requirement: user_settings table schema

The system SHALL define a `user_settings` table with columns: `user_id` (bigint PK, references users with CASCADE delete), `current_bank_id`, `exam_date`, `random_question_count` (default 20), `is_night_mode` (default false), `auto_next_question` (default true), `auto_save_wrong_question` (default true), `retry_wrong_limit` (default 100), `question_font_scale` (numeric 4,2, default 1.00), `question_layout_mode` (varchar 16, default 'smart'), `video_http_play_enabled` (default false), `video_autoplay_next` (default true), `video_seek_step_seconds` (default 15), `updated_at`.

#### Scenario: Migration creates user_settings table

- **WHEN** running `npm run db:migrate`
- **THEN** the `user_settings` table SHALL be created with all preference columns and their default values

### Requirement: admins table schema

The system SHALL define an `admins` table with columns: `id` (bigserial PK), `username` (varchar 64, unique), `password_hash` (varchar 255), `role` (varchar 16, default 'admin'), `created_at`, `updated_at`.

#### Scenario: Migration creates admins table

- **WHEN** running `npm run db:migrate`
- **THEN** the `admins` table SHALL be created with `username` unique constraint

### Requirement: Schema files organized by domain

Schema definitions SHALL be organized in `src/lib/schema/` with one file per domain (`users.ts`, `admins.ts`) and a barrel `index.ts` re-exporting all tables.

#### Scenario: All tables importable from schema index

- **WHEN** importing from `@/lib/schema`
- **THEN** all four table definitions (`users`, `user_profiles`, `user_settings`, `admins`) SHALL be available

### Requirement: Migration generation and execution scripts

The system SHALL provide npm scripts: `db:generate` to generate migration SQL from schema changes, `db:migrate` to execute pending migrations, and `db:studio` to open Drizzle Studio for visual inspection.

#### Scenario: Generate migration from schema

- **WHEN** running `npm run db:generate` after modifying a schema file
- **THEN** a new SQL file SHALL be created in the `drizzle/` directory reflecting the diff

#### Scenario: Execute pending migrations

- **WHEN** running `npm run db:migrate`
- **THEN** all pending migrations SHALL be applied to the database in order
