## 1. Database Schema

- [x] 1.1 Create `payment_transactions` table in `admin/src/lib/schema/payments.ts`.
- [x] 1.2 Export new schema in `admin/src/lib/schema/index.ts`.
- [x] 1.3 Generate and run database migrations (`npm run db:generate` and `npm run db:push`).

## 2. WeChat Pay Integration (Backend)

- [x] 2.1 Implement WeChat Pay V3 utilities (signature, certificate management) in `admin/src/lib/wechat-pay.ts`.
- [x] 2.2 Create `POST /api/v1/payments/wechat/orders` to initiate payments and get JSAPI parameters.
- [x] 2.3 Create `POST /api/callbacks/wechat/pay` for webhook handling with signature verification and decryption.
- [x] 2.4 Create `GET /api/v1/payments/wechat/query/:orderId` for manual status polling.

## 3. Order Fulfillment Logic

- [x] 3.1 Implement a centralized `fulfillOrder` function in `admin/src/lib/fulfillment.ts`.
- [x] 3.2 Integrate `fulfillOrder` into the webhook and query success handlers.
- [x] 3.3 Ensure idempotency in fulfillment logic by checking existing transaction status.

## 4. Mini-program UI & Integration

- [ ] 4.1 Implement payment selection logic (currently just WeChat Pay until C21 is ready).
- [ ] 4.2 Integrate `wx.requestPayment` and handle success/failure callbacks.
- [ ] 4.3 Create a simple payment success/failure result page.

## 5. Verification

- [ ] 5.1 Create automated tests for WeChat Pay signature verification logic.
- [ ] 5.2 Mock WeChat Pay callback notifications to test the full fulfillment flow.
- [ ] 5.3 Perform manual end-to-end tests using WeChat Pay Sandbox or test accounts.
