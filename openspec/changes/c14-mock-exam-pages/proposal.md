## Why

With the mock exam APIs implemented (C13), users now need a dedicated user interface to browse available mock papers, start timed exams, and view their results in a way that differentiates from standard practice.

## What Changes

- **Mock Paper Selection**: A new page to list available mock exam papers for a selected question bank.
- **Exam Entry Page**: A pre-exam page showing paper details (duration, passing score, total questions) and instructions.
- **Timed Exam Page**: A specialized version of the practice page featuring a countdown timer, answer submission without immediate feedback, and an auto-submit mechanism when time expires.
- **Mock Results View**: A results page tailored for mock exams, showing pass/fail status and time spent.

## Capabilities

### New Capabilities
- `mock-paper-selection-ui`: UI for browsing and selecting mock papers.
- `mock-exam-countdown`: Real-time countdown timer and session management for mock exams.
- `mock-exam-navigation`: Specialized navigation and submission flow for mock exams (no immediate feedback).

### Modified Capabilities
- `practice-history`: Modified to include mock exam labels and direct navigation to mock results.

## Impact

- **Mini-program Pages**: New pages `pages/mock-list/` and `pages/mock-exam/`.
- **Practice Page**: Reusable components from the practice page will be adapted for mock exams.
- **Results Page**: Logic added to handle mock-specific data (pass/fail).
