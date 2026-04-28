## 1. Database Schema Updates

- [x] 1.1 Add `paperId` column to `practiceSessions` table in `admin/src/lib/schema/practice-sessions.ts`.
- [x] 1.2 Generate and run database migrations.

## 2. Mock Paper APIs

- [x] 2.1 Implement `GET /api/v1/mock/papers` for listing mock papers by bank.
- [x] 2.2 Implement `GET /api/v1/mock/papers/[id]` for retrieving paper details.

## 3. Mock Session APIs

- [x] 3.1 Implement `POST /api/v1/mock/sessions` to start a mock exam session.
- [x] 3.2 Update `POST /api/v1/practice/sessions/[id]/submit` to handle mock session submissions (ensure `mode: mock` is respected).
- [x] 3.3 Update `POST /api/v1/practice/sessions/[id]/finish` to handle mock session finalization with time validation.

## 4. Integration and Testing

- [x] 4.1 Create a test script `admin/scripts/test-mock-api.ts` to verify the mock exam lifecycle.
- [x] 4.2 Update `miniprogram/services/types.ts` with mock-related interfaces.
- [x] 4.3 Create `miniprogram/services/mock.ts` for mock exam service methods.
