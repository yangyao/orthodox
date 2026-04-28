## Context

The mini-program needs a robust way to track user progress during practice sessions. Currently, the backend has schemas for question banks and questions, but lacks the ability to record user interactions and session states.

## Goals / Non-Goals

**Goals:**
- Implement database tables for sessions and answers.
- Create RESTful API endpoints for session lifecycle.
- Implement scoring logic on the backend to ensure integrity.
- Provide a mini-program service for easy integration with UI components.

**Non-Goals:**
- Complex analytics or long-term trends (focus on individual session management).
- UI implementation for the practice page (this is purely API and service layer).

## Decisions

- **Relational Schema**: Use Drizzle ORM to define `practice_sessions` and `practice_answers` tables.
  - `practice_sessions`: Tracks metadata (user_id, bank_id, status, score).
  - `practice_answers`: Links questions to sessions with the user's selected option and correctness.
- **RESTful Endpoints**:
  - `POST /api/v1/practice/sessions`: Start a new session.
  - `GET /api/v1/practice/sessions/:id`: Get session details/progress.
  - `POST /api/v1/practice/sessions/:id/submit`: Submit an answer for a question.
  - `POST /api/v1/practice/sessions/:id/finish`: Finalize the session and calculate score.
- **Backend Scoring**: All correctness checking and score calculation will happen on the server to prevent client-side manipulation.

## Risks / Trade-offs

- **[Risk] High database write volume** → If many users practice simultaneously, the `practice_answers` table will grow rapidly. **Mitigation**: Ensure proper indexing and consider archiving old sessions if necessary in the future.
- **[Risk] Connectivity issues during practice** → User might lose progress if they submit an answer and the network fails. **Mitigation**: Client-side state management in the mini-program to allow retrying submissions.
