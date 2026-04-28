## ADDED Requirements

### Requirement: WeChat Pay V3 Order Creation
The system SHALL support creating a WeChat Pay JSAPI/Native order via the WeChat Pay V3 API.

#### Scenario: Successful order creation
- **WHEN** Backend receives a request to pay for an order with `paymentMethod: 'wechat'`
- **THEN** Backend SHALL call WeChat Pay V3 `transactions/jsapi` (or native) endpoint and return signed payment parameters (`timeStamp`, `nonceStr`, `package`, `signType`, `paySign`) to the mini-program.

### Requirement: WeChat Pay Signature Verification
The system MUST verify the authenticity of all incoming WeChat Pay webhook notifications using the platform's public certificate and SHA256withRSA algorithm.

#### Scenario: Valid webhook notification
- **WHEN** WeChat Pay sends a POST notification to the callback URL with valid headers and signature
- **THEN** Backend SHALL decrypt the resource payload and process the payment status update.

#### Scenario: Invalid webhook notification
- **WHEN** WeChat Pay sends a notification with an invalid signature
- **THEN** Backend SHALL return a 401 Unauthorized status and ignore the payload.

### Requirement: Payment Status Query Fallback
The system SHALL provide an API to manually query the status of a WeChat Pay order as a fallback for missed webhooks.

#### Scenario: Manual status check
- **WHEN** Mini-program or background job requests status for an order
- **THEN** Backend SHALL query the WeChat Pay V3 API and update the local order status if it has changed to `SUCCESS`.
