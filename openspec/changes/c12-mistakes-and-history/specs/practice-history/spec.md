## ADDED Requirements

### Requirement: View Practice Session List
The system SHALL allow users to view a list of their past practice sessions, sorted by date (newest first).

#### Scenario: Displaying session list
- **WHEN** user opens the "Practice History" page
- **THEN** the system displays a list of sessions showing bank name, date, and score

### Requirement: View Session Details
The system SHALL allow users to click on a past session to view its detailed results, including correctly and incorrectly answered questions.

#### Scenario: Viewing session details
- **WHEN** user taps on a specific session in the history list
- **THEN** the system navigates to the results page for that session
