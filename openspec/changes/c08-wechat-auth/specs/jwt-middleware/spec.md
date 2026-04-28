## ADDED Requirements

### Requirement: JWT token issuance
系统 SHALL 提供 `lib/jwt.ts` 工具模块，使用 HS256 算法签发 JWT token。

#### Scenario: Sign token for user
- **WHEN** 调用 `signToken(userId)` 传入用户 ID
- **THEN** 系统 SHALL 签发 JWT，payload 为 `{ sub: String(userId), iat, exp }`，有效期 7 天，使用 `JWT_SECRET` 环境变量作为密钥

### Requirement: JWT token verification
系统 SHALL 提供 `verifyToken(token)` 函数验证 JWT 签名和有效期。

#### Scenario: Valid token
- **WHEN** 调用 `verifyToken(validToken)`
- **THEN** 系统 SHALL 返回 `{ sub: userId }` 解码后的 payload

#### Scenario: Expired token
- **WHEN** 调用 `verifyToken(expiredToken)`
- **THEN** 系统 SHALL 返回 null

#### Scenario: Invalid signature
- **WHEN** 调用 `verifyToken(tamperedToken)`
- **THEN** 系统 SHALL 返回 null

### Requirement: Request authentication helper
系统 SHALL 提供 `authenticateUser(request)` helper 函数，从请求中提取并验证 Bearer token。

#### Scenario: Valid Bearer token in header
- **WHEN** 请求包含 `Authorization: Bearer valid_token`
- **THEN** 系统 SHALL 验证 token，返回 `{ userId: bigint }`

#### Scenario: Missing Authorization header
- **WHEN** 请求未包含 Authorization header
- **THEN** 系统 SHALL 返回 `{ error: NextResponse }`，HTTP 401

#### Scenario: Malformed Authorization header
- **WHEN** Authorization header 不以 "Bearer " 开头
- **THEN** 系统 SHALL 返回 `{ error: NextResponse }`，HTTP 401
