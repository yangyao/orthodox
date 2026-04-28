## ADDED Requirements

### Requirement: Order Fulfillment
Upon successful payment (confirmed via webhook or query), the system SHALL fulfill the order based on its type.

#### Scenario: Question bank access fulfillment
- **WHEN** An order for a question bank is marked as `paid`
- **THEN** System SHALL automatically grant the user access to that question bank in the `user_bank_entitlements` table.

### Requirement: Transaction Logging
The system SHALL create a `payment_transactions` record for every payment attempt, regardless of whether it succeeds or fails.

#### Scenario: Failed payment attempt
- **WHEN** A WeChat Pay transaction is closed without payment
- **THEN** System SHALL mark the corresponding `payment_transaction` as `closed` or `failed` and keep the order status as `pending` (if not expired).

### Requirement: Idempotent Webhook Processing
The system MUST handle duplicate webhook notifications without processing the same payment twice.

#### Scenario: Duplicate webhook
- **WHEN** Backend receives a second successful webhook for an already-paid transaction
- **THEN** Backend SHALL acknowledge the notification but perform no further database updates.
