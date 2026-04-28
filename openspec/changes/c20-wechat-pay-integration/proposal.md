## Why

The platform currently lacks a direct monetary payment method for users to purchase question bank access or top up their wallets. Integrating WeChat Pay is essential for monetization, providing a seamless checkout experience for users within the mini-program environment.

## What Changes

- **Backend**:
  - Integration with WeChat Pay V3 API for order creation and payment verification.
  - Implementation of a secure webhook endpoint to handle asynchronous payment notifications.
  - New database table `payment_transactions` to track payment history and status.
- **Mini-program**:
  - Implementation of the `wx.requestPayment` flow to initiate transactions.
  - Payment status checking and confirmation pages.
  - Integration of WeChat Pay as a payment option in the checkout flow.

## Capabilities

### New Capabilities
- `wechat-pay`: Implementation of WeChat Pay V3 integration, including signature verification, order creation, and webhook handling.
- `payment-fulfillment`: Orchestrating the fulfillment of orders (granting entitlements) upon successful payment confirmation.

### Modified Capabilities
- (None)

## Impact

- **APIs**: New endpoints under `/api/v1/payments/wechat` for orders and webhooks.
- **Database**: New `payment_transactions` table; updates to `orders` status management.
- **UI**: Integration of `wx.requestPayment` in mini-program; payment success/failure feedback.
