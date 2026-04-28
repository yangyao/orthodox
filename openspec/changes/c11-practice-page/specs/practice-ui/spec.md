## ADDED Requirements

### Requirement: Display Question Content
The practice page SHALL display the question stem and a list of options (A, B, C, D) for the current question.

#### Scenario: Displaying a single choice question
- **WHEN** the practice page loads a single choice question
- **THEN** it displays the stem text and four selectable options

### Requirement: Submit Answer and Get Feedback
The system SHALL allow users to select an option and submit it for immediate feedback.

#### Scenario: Submitting a correct answer
- **WHEN** user selects the correct option and taps "Confirm" or selects (if auto-submit enabled)
- **THEN** the option highlights in green and the explanation is displayed

#### Scenario: Submitting an incorrect answer
- **WHEN** user selects an incorrect option
- **THEN** the selected option highlights in red, the correct option highlights in green, and the explanation is displayed
