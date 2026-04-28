## Context

The system already tracks practice sessions and answers (C10) and has a functional practice UI (C11). This design focuses on extending these capabilities to provide persistence for "Wrong Questions" and a history view.

## Goals / Non-Goals

**Goals:**
- Implement a `wrong_questions` table to track mistakes per user and per bank.
- Implement API endpoints for fetching history and mistake sets.
- Create mini-program pages for History and Mistake Set.
- Ensure incorrectly answered questions are automatically synced to the `wrong_questions` table.

**Non-Goals:**
- Complex data visualization (charts/graphs) for now.
- Exporting history to PDF/Excel.

## Decisions

- **Database Table**: `wrong_questions`
  - `id`: Primary key.
  - `user_id`: Reference to users.
  - `bank_id`: Reference to question banks.
  - `question_id`: Reference to questions.
  - `wrong_count`: Number of times this question was answered incorrectly.
  - `mastery_count`: Number of times this question was answered correctly in review mode.
  - `updated_at`: Last time the question was answered wrongly.
- **Backend Trigger**: When `submitAnswer` (C10) is called and the answer is incorrect, the backend will upsert a record into the `wrong_questions` table.
- **History View**: Reuse the existing `practice_sessions` table to list past sessions. Use pagination to handle large numbers of sessions.
- **Mistake Review Mode**: When starting a session in "Mistake Mode", the backend will fetch question IDs from the `wrong_questions` table instead of the standard question list.

## Risks / Trade-offs

- **[Risk] Large volume of wrong questions** → Performance degradation in fetching the mistake set. **Mitigation**: Implement pagination and filtering by question bank.
- **[Risk] Data duplication** → Storing similar information in `practice_answers` and `wrong_questions`. **Trade-off**: `practice_answers` is a ledger of every attempt, while `wrong_questions` is a specialized collection for review. Keeping them separate simplifies review logic.
