## Why

Currently, access to question banks is not strictly enforced based on user ownership or subscriptions. To support monetization and tiered access (e.g., free trial vs. paid full access), the system needs a robust mechanism to verify user entitlements before allowing interaction with question bank content.

## What Changes

- **Entitlement Tracking**: A new database table `user_bank_entitlements` to record user access rights to specific question banks, including expiration dates.
- **Server-Side Enforcement**: All APIs involving question bank content (practice sessions, mock exams, favorites, notes) will now verify the user's entitlement for the targeted bank.
- **Access Control Middleware**: Implementation of a reusable check for bank access in the backend API layer.
- **Entitlement Management API**: New admin endpoints to grant, update, or revoke user access to question banks.
- **Frontend Lock UI**: The mini-program will display lock status for banks the user hasn't yet opened or purchased.

## Capabilities

### New Capabilities
- `bank-entitlement-verification`: Logic and middleware to enforce access control based on user entitlements.
- `bank-entitlement-admin`: Administrative tools to manage user-to-bank associations.

### Modified Capabilities
<!-- None -->

## Impact

- **Database**: New `user_bank_entitlements` table.
- **Backend API**: Updated practice, mock, and user-content (favorites/notes) endpoints to include entitlement checks.
- **Mini-program**: Updated bank listing and detail pages to reflect access status.
