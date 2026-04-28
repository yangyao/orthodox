## 1. Database and Schema

- [x] 1.1 Define `favorites` table in `admin/src/lib/schema/favorites.ts`.
- [x] 1.2 Define `notes` table in `admin/src/lib/schema/notes.ts`.
- [x] 1.3 Export new schemas in `admin/src/lib/schema/index.ts`.
- [x] 1.4 Generate and run database migrations.

## 2. Backend APIs

- [x] 2.1 Implement `POST /api/v1/questions/:id/favorite` (Toggle).
- [x] 2.2 Implement `GET /api/v1/questions/:id/favorite` (Get status).
- [x] 2.3 Implement `POST /api/v1/questions/:id/note` (Upsert note).
- [x] 2.4 Implement `GET /api/v1/questions/:id/note` (Get note).
- [x] 2.5 Implement `GET /api/v1/me/favorites` (Paginated list).
- [x] 2.6 Implement `GET /api/v1/me/notes` (Paginated list of questions with notes).

## 3. Mini-program Services

- [x] 3.1 Update `miniprogram/services/questions.ts` with favorite and note methods.
- [x] 3.2 Define new interfaces in `miniprogram/services/types.ts`.

## 4. Mini-program UI Updates

- [x] 4.1 Add favorite and note icons/buttons to `miniprogram/components/question-renderer/`.
- [x] 4.2 Implement "Add/Edit Note" modal/bottom-sheet.
- [x] 4.3 Create `miniprogram/pages/favorites/` to browse favorited questions.
- [x] 4.4 Create `miniprogram/pages/my-notes/` to browse questions with notes.
- [x] 4.5 Register new pages in `app.json`.
- [x] 4.6 Add entry points in `pages/mine/`.

## 5. Verification

- [x] 5.1 Create a test script `admin/scripts/test-favorites-notes.ts` to verify API logic.
- [x] 5.2 Verify UI interaction for favoriting and note-taking.
