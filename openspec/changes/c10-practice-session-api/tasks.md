## 1. Database Schema

- [x] 1.1 Define `practice_sessions` table in `admin/src/lib/schema/practice-sessions.ts`.
- [x] 1.2 Define `practice_answers` table in `admin/src/lib/schema/practice-answers.ts`.
- [x] 1.3 Export new schemas in `admin/src/lib/schema/index.ts`.
- [x] 1.4 Generate and run database migrations.

## 2. Backend API Implementation

- [x] 2.1 Implement `POST /api/v1/practice/sessions` endpoint to start a practice session.
- [x] 2.2 Implement `GET /api/v1/practice/sessions/:id` endpoint to retrieve session details.
- [x] 2.3 Implement `POST /api/v1/practice/sessions/:id/submit` endpoint for answer submission and instant feedback.
- [x] 2.4 Implement `POST /api/v1/practice/sessions/:id/finish` endpoint to finalize the session and calculate the score.

## 3. Mini-program Service

- [x] 3.1 Define TypeScript interfaces for Practice Session, Question Answer, and Results in `miniprogram/services/types.ts`.
- [x] 3.2 Implement `miniprogram/services/practice.ts` with methods to interact with the new practice APIs.

## 4. Verification

- [x] 4.1 Write integration tests for session creation and answer submission in the backend.
- [x] 4.2 Verify the end-to-end flow using mock calls in the mini-program.
