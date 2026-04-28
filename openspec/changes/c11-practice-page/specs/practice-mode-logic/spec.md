## ADDED Requirements

### Requirement: Random Practice Mode
The system SHALL support a random practice mode where question order is shuffled.

#### Scenario: Starting random practice
- **WHEN** user chooses "Random Practice" for a question bank
- **THEN** the system initializes a session with questions in a randomized order

### Requirement: Chapter-based Practice
The system SHALL support filtering questions by chapter or section.

#### Scenario: Starting chapter practice
- **WHEN** user selects a specific chapter to practice
- **THEN** the system only includes questions belonging to that chapter in the session
