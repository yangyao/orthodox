## ADDED Requirements

### Requirement: Database connection reads DATABASE_URL from environment

The database connection module SHALL read the `DATABASE_URL` environment variable to establish a connection to PostgreSQL.

#### Scenario: Valid connection string provided

- **WHEN** `DATABASE_URL` is set to a valid PostgreSQL connection string in `.env`
- **THEN** the connection pool SHALL initialize successfully and queries SHALL execute without error

#### Scenario: Missing connection string

- **WHEN** `DATABASE_URL` is not set or is empty
- **THEN** the module SHALL throw a clear error message indicating the missing configuration

### Requirement: Connection pool configuration

The system SHALL use a connection pool with sensible defaults for Serverless deployment (max 10 connections, idle timeout 20 seconds).

#### Scenario: Pool settings are applied

- **WHEN** the database connection is initialized
- **THEN** the pool SHALL be configured with `max: 10` and `idle_timeout: 20`

### Requirement: Singleton connection per process

The system SHALL export a single shared database client instance to avoid creating multiple pools per process.

#### Scenario: Multiple imports reuse same pool

- **WHEN** the db module is imported from multiple files
- **THEN** they SHALL all use the same underlying connection pool instance

### Requirement: Drizzle ORM integration

The system SHALL export a Drizzle query builder instance initialized with the database connection and schema.

#### Scenario: Query builder uses schema types

- **WHEN** using the exported db instance to query a table
- **THEN** TypeScript SHALL provide type checking for table columns and return types
