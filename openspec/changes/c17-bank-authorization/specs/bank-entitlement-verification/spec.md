## ADDED Requirements

### Requirement: Verify User Bank Entitlement
The system SHALL verify that a user has a valid and unexpired entitlement for a specific question bank before granting access to its content (questions, practice sessions, mock exams, etc.).

#### Scenario: Authorized access to bank
- **WHEN** user with valid entitlement attempts to start a practice session for a specific bank
- **THEN** the system SHALL allow the session to be created

#### Scenario: Unauthorized access to bank
- **WHEN** user without entitlement attempts to start a practice session for a specific bank
- **THEN** the system SHALL return a 403 Forbidden error with a message indicating missing entitlement

### Requirement: Expired Entitlement Check
The system SHALL treat entitlements past their `expiresAt` date as invalid.

#### Scenario: Access with expired entitlement
- **WHEN** user with an expired entitlement attempts to fetch a question from a bank
- **THEN** the system SHALL return a 403 Forbidden error
