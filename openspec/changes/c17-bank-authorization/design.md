## Context

Currently, the system lacks a formal authorization layer for question bank content. Most data is accessible to any logged-in user. As we scale and introduce premium content, we need to ensure users only access question banks they are entitled to.

## Goals / Non-Goals

**Goals:**
- Implement a persistent storage for user bank entitlements.
- Add server-side verification for all content-related APIs.
- Provide a clear UI indicating whether a bank is "opened" (accessible) or "locked".
- Allow administrators to manage user access manually.

**Non-Goals:**
- Implementation of a full payment gateway (handled in a separate change if needed).
- Granular permissions within a bank (access is all-or-nothing per bank).

## Decisions

- **Database Table**: Create `user_bank_entitlements` with columns:
  - `id`: Primary key.
  - `userId`: Foreign key to users.
  - `bankId`: Foreign key to question banks.
  - `status`: String (e.g., 'active', 'expired').
  - `expiresAt`: Optional timestamp for time-limited access.
  - `createdAt`, `updatedAt`: Standard timestamps.
- **Backend Middleware/Helper**: Implement a `checkEntitlement(userId, bankId)` helper in `admin/src/lib/bank-auth.ts`. This will be called at the beginning of routes like `start-session`, `fetch-question`, `toggle-favorite`, etc.
- **API Response Enhancement**: The `GET /api/v1/banks` and `GET /api/v1/banks/:id` endpoints will be updated to include an `isOpened` boolean for the current user.
- **Access Flow**: If a bank is "free", the user can click an "Open" button in the mini-program, which will call a new `POST /api/v1/banks/:id/open` endpoint to create a free entitlement record.

## Risks / Trade-offs

- **[Risk] Latency** → Adding a DB check to every content request might increase latency. **Mitigation**: Use a composite index on `(userId, bankId)` in the `user_bank_entitlements` table for O(1) lookups.
- **[Risk] Complexity** → Retrofitting entitlement checks into all existing endpoints. **Mitigation**: Centralize the check logic and use a consistent error response format.
