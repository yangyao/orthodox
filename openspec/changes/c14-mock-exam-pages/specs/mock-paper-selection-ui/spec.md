## ADDED Requirements

### Requirement: Browse Mock Papers
The system SHALL display a list of available mock exam papers for the selected question bank.

#### Scenario: User views mock papers
- **WHEN** user navigates to the Mock List page for a bank
- **THEN** the system displays a list of papers showing title, year, duration, and question count

### Requirement: Mock Paper Entry Details
The system SHALL show a confirmation/detail view before starting a mock exam.

#### Scenario: User selects a mock paper
- **WHEN** user taps on a mock paper from the list
- **THEN** the system displays a modal or page with exam rules, duration, and a "Start Exam" button
