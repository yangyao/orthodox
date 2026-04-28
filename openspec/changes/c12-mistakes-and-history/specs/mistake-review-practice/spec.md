## ADDED Requirements

### Requirement: Practice Questions in Mistake Set
The system SHALL provide a way for users to enter a practice mode that only includes questions from their "Mistake Set".

#### Scenario: Starting mistake review
- **WHEN** user selects "Review Mistakes" for a specific question bank or globally
- **THEN** the system initializes a practice session containing only questions from the user's mistake set

### Requirement: Automatic Removal on Mastery (Optional/Configurable)
The system SHALL support a configuration where a question is automatically removed from the mistake set after it is answered correctly a certain number of times.

#### Scenario: Question auto-removed after correct answer
- **WHEN** user answers a question correctly in "Mistake Review" mode
- **THEN** the system increments the mastery count and removes it if the threshold is met
