## Context

Users want to persist interactions with specific questions. Currently, we have `practice_sessions` and `wrong_questions`, but no explicit "Favorite" or "Personal Note" tracking.

## Goals / Non-Goals

**Goals:**
- Provide a way to favorite/unfavorite questions.
- Provide a way to save and edit a personal note for each question.
- Create UI entry points in the `QuestionRenderer` or a separate overlay.
- Implement dedicated pages for browsing all favorites and questions with notes.

**Non-Goals:**
- Social features (sharing notes).
- Rich-text or image notes (text only for now).

## Decisions

- **Database Schema**:
  - `favorites` table: `id`, `userId`, `questionId`, `bankId`, `createdAt`.
  - `notes` table: `id`, `userId`, `questionId`, `bankId`, `content`, `updatedAt`, `createdAt`.
- **API Endpoints**:
  - `POST /api/v1/questions/:id/favorite` (Toggle).
  - `GET /api/v1/questions/:id/favorite` (Get status).
  - `POST /api/v1/questions/:id/note` (Upsert content).
  - `GET /api/v1/questions/:id/note` (Get note).
  - `GET /api/v1/me/favorites` (List all favorites).
  - `GET /api/v1/me/notes` (List all questions with notes).
- **UI Integration**:
  - Update `miniprogram/components/question-renderer/` to include a favorite icon and a "Note" button.
  - The "Note" button will open a bottom sheet or a modal with a `textarea`.
- **Performance**:
  - Use composite indexes on `userId` and `questionId` for fast lookups.

## Risks / Trade-offs

- **[Risk] High volume of notes** → Database growth. **Mitigation**: Limit note length to 1000 characters.
- **[Risk] UI Clutter** → Too many buttons on the question view. **Mitigation**: Place favorites and notes in a secondary action bar or a more menu.
