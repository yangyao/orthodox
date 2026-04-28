## ADDED Requirements

### Requirement: Calculate Session Score
The system SHALL calculate the total score and accuracy rate upon completion of a practice session.

#### Scenario: Completing a session
- **WHEN** user submits the final answer in a practice session or chooses to finish
- **THEN** the system calculates the percentage of correct answers and provides a summary report

### Requirement: Answer Feedback
The system SHALL provide immediate correctness feedback for each submitted answer.

#### Scenario: Instant feedback for single choice
- **WHEN** user submits an answer for a single-choice question
- **THEN** the system compares it with the correct answer and returns a boolean result immediately
