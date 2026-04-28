## Why

Users need to simulate real exam conditions with timed sessions, specific question sets (mock papers), and a final scoring mechanism. This change provides the backend infrastructure to support mock examinations.

## What Changes

- **Mock Paper Management**: APIs to list and retrieve mock paper metadata.
- **Mock Session Lifecycle**: APIs to start, submit answers, and finish a mock exam session.
- **Timed Support**: Backend tracking of start and end times to enforce exam durations.
- **Result Persistence**: Storing mock exam results separately from standard practice sessions.

## Capabilities

### New Capabilities
- `mock-paper-list`: Ability for users to browse available mock exam papers for a specific question bank.
- `mock-exam-session`: Full lifecycle management (start, submit, finish) for a timed mock examination.

### Modified Capabilities
<!-- None -->

## Impact

- **Database**: Utilization of `mock_papers` and `mock_paper_questions` tables.
- **Backend API**: New endpoints under `/api/v1/mock/`.
- **Logic**: Shared scoring logic with practice sessions, but with strict timing and fixed question sets.
