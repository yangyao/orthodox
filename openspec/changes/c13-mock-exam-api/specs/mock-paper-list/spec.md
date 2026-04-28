## ADDED Requirements

### Requirement: List Available Mock Papers
The system SHALL provide an API to list mock papers for a given question bank, including title, duration, and total questions.

#### Scenario: User views mock paper list
- **WHEN** user requests mock papers for bank ID `123`
- **THEN** the system returns a list of mock papers associated with that bank

### Requirement: Get Mock Paper Details
The system SHALL provide an API to retrieve details of a specific mock paper.

#### Scenario: User views mock paper details
- **WHEN** user requests details for paper ID `456`
- **THEN** the system returns the paper metadata
