## ADDED Requirements

### Requirement: Get current user info
系统 SHALL 提供 `GET /api/v1/me` 接口，返回当前认证用户的基本信息和 profile。

#### Scenario: Authenticated user fetches profile
- **WHEN** 请求 `GET /api/v1/me`，携带有效 Bearer token
- **THEN** 系统 SHALL 返回 `{ code: 0, data: { id, openid, mobile, status, profile: { nickname, avatarUrl, gender, province, city } } }`

#### Scenario: No or invalid token
- **WHEN** 请求 `GET /api/v1/me`，未携带 Authorization header 或 token 无效/过期
- **THEN** 系统 SHALL 返回 `{ code: 401, message: "未登录", data: null }`，HTTP 401

### Requirement: Update user profile
系统 SHALL 提供 `PATCH /api/v1/me/profile` 接口，允许用户更新个人资料。

#### Scenario: Update nickname and avatar
- **WHEN** 请求 `PATCH /api/v1/me/profile`，body 为 `{ "nickname": "新昵称", "avatarUrl": "https://..." }`，携带有效 token
- **THEN** 系统 SHALL 更新 user_profiles 表对应记录，返回 `{ code: 0, data: { nickname, avatarUrl, ... } }`

#### Scenario: Partial update
- **WHEN** 请求 `PATCH /api/v1/me/profile`，body 只包含 `{ "gender": 1 }`
- **THEN** 系统 SHALL 只更新 gender 字段，其他字段保持不变

#### Scenario: Field validation
- **WHEN** 请求 `PATCH /api/v1/me/profile`，nickname 超过 64 个字符
- **THEN** 系统 SHALL 返回参数校验错误，HTTP 400
