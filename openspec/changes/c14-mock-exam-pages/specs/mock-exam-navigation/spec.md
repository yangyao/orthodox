## ADDED Requirements

### Requirement: Delayed Correctness Feedback
The system SHALL NOT show immediate correctness feedback (correct/incorrect indicators or explanations) during a mock exam session.

#### Scenario: User answers a question
- **WHEN** user selects an answer in mock exam mode
- **THEN** the system saves the answer but does NOT show if it is correct or incorrect

### Requirement: Bulk Submission
The system SHALL allow users to navigate between all questions and perform a final submission of the entire exam.

#### Scenario: User navigates questions
- **WHEN** user is in a mock exam
- **THEN** they can swipe or use a navigation sheet to visit any question without submitting the whole exam
