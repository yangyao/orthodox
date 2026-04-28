## ADDED Requirements

### Requirement: Default admin seed data

The system SHALL provide a seed script that inserts a default admin account with username "admin" and a hashed password.

#### Scenario: Running seed script first time

- **WHEN** running `npm run db:seed`
- **THEN** an admin record SHALL be inserted with username "admin", role "super_admin", and a bcrypt-hashed default password

#### Scenario: Running seed script repeatedly

- **WHEN** running `npm run db:seed` when the admin already exists
- **THEN** the script SHALL NOT fail and SHALL NOT create duplicate records (idempotent)

### Requirement: Seed script uses schema types

The seed script SHALL use the Drizzle db instance and schema definitions for type-safe inserts.

#### Scenario: Seed insert is type checked

- **WHEN** the seed script is compiled
- **THEN** TypeScript SHALL validate the insert payload against the `admins` table schema
