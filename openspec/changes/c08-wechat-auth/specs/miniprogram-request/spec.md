## ADDED Requirements

### Requirement: Unified HTTP request wrapper
小程序端 SHALL 提供 `services/request.ts`，封装 `wx.request`，自动携带 Bearer token、统一错误处理。

#### Scenario: Normal request with valid token
- **WHEN** 调用 `request({ url: '/api/v1/me', method: 'GET' })`，本地存储有有效 token
- **THEN** 系统 SHALL 自动在 header 中添加 `Authorization: Bearer {token}`，发起请求并返回解析后的 data 字段

#### Scenario: 401 response triggers re-login
- **WHEN** 请求返回 HTTP 401
- **THEN** 系统 SHALL 自动调用 `services/auth.ts` 的静默登录，获取新 token 后重试原请求，最多重试 1 次

#### Scenario: Network error
- **WHEN** 请求因网络问题失败（无响应）
- **THEN** 系统 SHALL 返回 Promise reject，错误信息为"网络异常，请稍后重试"

#### Scenario: Server error
- **WHEN** 请求返回 HTTP 5xx
- **THEN** 系统 SHALL 返回 Promise reject，错误信息为"服务器错误，请稍后重试"

### Requirement: Auth service for miniprogram
小程序端 SHALL 提供 `services/auth.ts`，封装 `wx.login` + 后端登录 + token 持久化。

#### Scenario: Silent login on app launch
- **WHEN** 调用 `silentLogin()`，本地无 token 或 token 过期
- **THEN** 系统 SHALL 调用 `wx.login()` 获取 code，发送到 `POST /api/v1/auth/login`，将返回的 token 存入 `wx.setStorageSync('access_token', token)`

#### Scenario: Already has valid token
- **WHEN** 调用 `silentLogin()`，本地已有 token 且未过期
- **THEN** 系统 SHALL 直接返回现有 token，不发起网络请求

#### Scenario: Token persistence
- **WHEN** 登录成功获取 token
- **THEN** 系统 SHALL 将 token 存入 `wx.setStorageSync('access_token', token)`
