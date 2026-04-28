## ADDED Requirements

### Requirement: Start Practice Session
The system SHALL allow users to start a new practice session for a specific question bank or section.

#### Scenario: Starting a session successfully
- **WHEN** user selects a question bank and chooses "Start Practice"
- **THEN** the system creates a session record and returns a unique session ID along with a list of question IDs to be practiced

### Requirement: Submit Answer
The system SHALL allow users to submit an answer for a specific question within an active practice session.

#### Scenario: Submitting a correct answer
- **WHEN** user submits the correct answer for a question in a session
- **THEN** the system records the answer, marks it as correct, and returns instant feedback indicating success

#### Scenario: Submitting an incorrect answer
- **WHEN** user submits an incorrect answer for a question in a session
- **THEN** the system records the answer, marks it as incorrect, and returns the correct answer and explanation

### Requirement: Resume Session
The system SHALL allow users to resume an unfinished practice session.

#### Scenario: Resuming a session
- **WHEN** user opens a previously started but incomplete session
- **THEN** the system returns the current progress, including which questions have been answered and the results of those answers
