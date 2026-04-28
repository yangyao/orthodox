## ADDED Requirements

### Requirement: Real-time Countdown Timer
The system SHALL display a countdown timer during a mock exam session, indicating the remaining time.

#### Scenario: Timer updates every second
- **WHEN** a mock exam session is active
- **THEN** the system updates the countdown timer every second on the screen

### Requirement: Auto-submit on Time Expiration
The system SHALL automatically submit the current exam session and navigate to results when the timer reaches zero.

#### Scenario: Time expires
- **WHEN** the countdown timer reaches zero
- **THEN** the system calls the finish API and navigates to the Results page
