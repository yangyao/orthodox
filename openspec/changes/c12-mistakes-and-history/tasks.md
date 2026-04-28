## 1. Database and Backend

- [x] 1.1 Define `wrong_questions` table in `admin/src/lib/schema/wrong-questions.ts`.
- [x] 1.2 Update `admin/src/app/api/v1/practice/sessions/[id]/submit/route.ts` to upsert into `wrong_questions` on incorrect answers.
- [x] 1.3 Implement `GET /api/v1/practice/history` for listing past sessions.
- [x] 1.4 Implement `GET /api/v1/practice/mistakes` for fetching the list of wrong questions.
- [x] 1.5 Implement `DELETE /api/v1/practice/mistakes/:id` for manual removal.
- [x] 1.6 Update `POST /api/v1/practice/sessions` to support `mode: "mistake"`.

## 2. Mini-program Services

- [x] 2.1 Update `miniprogram/services/practice.ts` to include methods for history and mistakes.
- [x] 2.2 Define new interfaces in `miniprogram/services/types.ts`.

## 3. Mini-program Pages

- [x] 3.1 Create `miniprogram/pages/history/` for viewing practice history.
- [x] 3.2 Create `miniprogram/pages/mistakes/` for viewing and managing the mistake set.
- [x] 3.3 Add entry points for History and Mistakes in `miniprogram/pages/index/` and `miniprogram/pages/mine/` (if it exists).

## 4. Integration and Testing

- [x] 4.1 Update `app.json` to include the new pages.
- [x] 4.2 Verify the end-to-end flow of answering wrongly and seeing it in the mistake set.
- [x] 4.3 Verify mistake review mode works correctly.
