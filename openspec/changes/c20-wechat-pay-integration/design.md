## Context

The system currently supports question bank browsing and basic order creation (from C19), but lacks the actual payment fulfillment logic via WeChat Pay. This change introduces the WeChat Pay V3 integration layer.

## Goals / Non-Goals

**Goals:**
- Implement WeChat Pay V3 (Native/JSAPI for mini-program) integration.
- Implement a secure webhook callback handler with signature verification.
- Ensure idempotent processing of payment notifications.
- Provide payment status feedback in the mini-program.

**Non-Goals:**
- Wallet system implementation (handled in C21).
- Automated refund processing.
- Activation code management (handled in C22).

## Decisions

### D1: WeChat Pay V3 Integration
We will implement the WeChat Pay V3 integration using standard cryptographic libraries (`crypto` in Node.js) to handle signatures and encryption. We will use the platform's private key to sign requests and the WeChat Pay public certificate to verify responses/webhooks.

### D2: Transaction Tracking
A new `payment_transactions` table will be introduced to track every attempt made through WeChat Pay. Each record will link to an `order_id` and store the `provider_trade_no` (WeChat Pay transaction ID) once available.

### D3: Fulfillment Orchestration
Upon receiving a `SUCCESS` status from WeChat Pay (either via webhook or query), the system will trigger a fulfillment service that grants the user the appropriate entitlements (e.g., bank access) based on the order items.

## Risks / Trade-offs

- **[Risk]** Webhook delivery failure or delay.
  - **Mitigation**: Implement active polling from the mini-program to query order status if the webhook is not received within a few seconds of payment.
- **[Risk]** Security of WeChat Pay private keys.
  - **Mitigation**: Use environment variables (`WXPAY_PRIVATE_KEY`, `WXPAY_CERT_SERIAL`, etc.) to store sensitive configuration.
