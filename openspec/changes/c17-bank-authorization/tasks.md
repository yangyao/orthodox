## 1. Database and Schema

- [x] 1.1 Define `user_bank_entitlements` table in `admin/src/lib/schema/bank-entitlements.ts`.
- [x] 1.2 Export new schema in `admin/src/lib/schema/index.ts`.
- [x] 1.3 Generate and run database migrations.

## 2. Backend Logic and Middleware

- [x] 2.1 Implement `checkEntitlement` helper in `admin/src/lib/bank-auth.ts`.
- [x] 2.2 Create `POST /api/v1/banks/:id/open` endpoint for activating free/trial access.
- [x] 2.3 Update `GET /api/v1/banks` and `GET /api/v1/banks/:id` to return `isOpened` status.
- [x] 2.4 Integrate `checkEntitlement` into `POST /api/v1/practice/sessions` (start practice).
- [x] 2.5 Integrate `checkEntitlement` into `POST /api/v1/mock/sessions` (start mock).
- [x] 2.6 Integrate `checkEntitlement` into `POST /api/v1/questions/:id/favorite` and `POST /api/v1/questions/:id/note`.

## 3. Admin APIs

- [x] 3.1 Implement `GET /api/admin/v1/users/:id/entitlements` to view user access.
- [x] 3.2 Implement `POST /api/admin/v1/users/:id/entitlements` to grant access.
- [x] 3.3 Implement `DELETE /api/admin/v1/users/:userId/entitlements/:bankId` to revoke access.

## 4. Mini-program UI Updates

- [x] 4.1 Update `bank-detail` page to show "Open Bank" or "Start Practice" based on `isOpened` status.
- [x] 4.2 Update `bank-card` component to show a lock icon if not opened.
- [x] 4.3 Handle 403 Forbidden errors by showing an "Access Denied" toast or modal.

## 5. Verification

- [x] 5.1 Create a test script `admin/scripts/test-bank-authorization.ts` to verify access control.
- [x] 5.2 Manually verify the "Open" flow for a free question bank.
