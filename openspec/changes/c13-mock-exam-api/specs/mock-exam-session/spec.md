## ADDED Requirements

### Requirement: Start Mock Exam Session
The system SHALL allow users to start a timed mock exam session for a selected paper. The session SHALL track the start time and the questions defined in the paper.

#### Scenario: User starts mock exam
- **WHEN** user starts an exam for paper ID `456`
- **THEN** the system creates a practice session with mode `mock`, records the start time, and returns question IDs

### Requirement: Enforce Exam Duration
The system SHALL track the elapsed time and ensure the exam is finished within the paper's defined duration.

#### Scenario: User finishes mock exam
- **WHEN** user submits the final exam before the duration expires
- **THEN** the system calculates the score and marks the session as `finished`

### Requirement: Mock Results Separation
Mock exam sessions SHALL be clearly distinguishable from standard practice sessions in history and results.

#### Scenario: User views practice history
- **WHEN** user filters history by mock exams
- **THEN** only sessions with mode `mock` are returned
