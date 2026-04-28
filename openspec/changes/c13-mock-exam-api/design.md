## Context

The system currently supports standard practice sessions (sequential, random, mistake). Mock exams require fixed question sets (mock papers) and duration tracking.

## Goals / Non-Goals

**Goals:**
- Implement APIs to browse mock papers.
- Extend practice session logic to handle timed mock exams.
- reuse existing `practice_sessions` and `practice_answers` tables where possible.

**Non-Goals:**
- UI implementation for mock exams in this phase.
- Proctored exam features (webcam, lock-down browser).

## Decisions

- **New Table/Column**: Add `paper_id` to `practice_sessions` to link a session to a mock paper.
- **Session Mode**: Introduce `mode: 'mock'` in `practice_sessions`.
- **Endpoints**:
  - `GET /api/v1/mock/papers`: List papers for a bank.
  - `GET /api/v1/mock/papers/:id`: Paper details.
  - `POST /api/v1/mock/sessions`: Start a mock session (analogous to practice session start).
- **Duration Tracking**: Store `startTime` and `endTime` (if finished) in the session. Use the paper's `duration` to calculate the deadline.
- **Scoring**: Reuse the scoring logic from practice sessions, triggered on `POST /api/v1/mock/sessions/:id/finish`.

## Risks / Trade-offs

- **[Risk] Syncing duration** → Client-side clock skew. **Mitigation**: Always use server-side timestamps for start and finish times.
- **[Risk] Database complexity** → Reusing `practice_sessions` for mock exams. **Trade-off**: Simplifies history and result views, but requires careful filtering by `mode`.
