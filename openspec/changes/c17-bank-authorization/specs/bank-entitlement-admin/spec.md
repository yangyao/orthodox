## ADDED Requirements

### Requirement: Admin Grant Entitlement
The system SHALL allow administrators to grant a user access to a specific question bank, specifying an optional expiration date.

#### Scenario: Admin grants unlimited access
- **WHEN** admin grants access to a bank for a user without specifying an expiration date
- **THEN** the system SHALL create an entitlement with no expiration

#### Scenario: Admin grants time-limited access
- **WHEN** admin grants access to a bank for a user with an expiration date of 30 days from now
- **THEN** the system SHALL create an entitlement that expires in 30 days

### Requirement: Admin Revoke Entitlement
The system SHALL allow administrators to revoke a user's entitlement to a question bank.

#### Scenario: Admin revokes access
- **WHEN** admin revokes a user's entitlement for a specific bank
- **THEN** the system SHALL remove the entitlement record, effectively blocking further access
