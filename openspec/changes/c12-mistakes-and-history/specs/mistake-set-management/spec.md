## ADDED Requirements

### Requirement: Automatic Collection of Wrong Questions
The system SHALL automatically add a question to the user's "Mistake Set" whenever it is answered incorrectly in any practice session.

#### Scenario: Question added to mistake set
- **WHEN** user submits an incorrect answer for a question
- **THEN** the system creates or updates a record for this question in the user's mistake set

### Requirement: Manual Removal from Mistake Set
The system SHALL allow users to manually remove a question from their "Mistake Set" once they no longer wish to review it.

#### Scenario: Removing a question
- **WHEN** user taps the "Remove" button for a question in the mistake set
- **THEN** the system removes the question from the set and updates the UI
