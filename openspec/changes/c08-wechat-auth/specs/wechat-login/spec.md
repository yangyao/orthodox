## ADDED Requirements

### Requirement: WeChat code login endpoint
系统 SHALL 提供 `POST /api/v1/auth/login` 接口，接收微信小程序 `wx.login()` 返回的 code，完成用户登录。

#### Scenario: New user first login
- **WHEN** 请求 `POST /api/v1/auth/login` body 为 `{ "code": "valid_wechat_code" }`，且该 code 对应的 openid 在 users 表中不存在
- **THEN** 系统 SHALL 调用微信 `jscode2session` API 获取 openid，在 users 表创建新记录，在 user_profiles 表创建关联空 profile，在 user_settings 表创建默认设置，返回 `{ code: 0, data: { token, user: { id, openid, isNewUser: true } } }`

#### Scenario: Existing user login
- **WHEN** 请求 `POST /api/v1/auth/login` body 为 `{ "code": "valid_wechat_code" }`，且该 openid 已存在于 users 表
- **THEN** 系统 SHALL 返回 `{ code: 0, data: { token, user: { id, openid, isNewUser: false } } }`，并更新 user_profiles.lastLoginAt 为当前时间

#### Scenario: Invalid or expired code
- **WHEN** 请求 `POST /api/v1/auth/login`，微信 jscode2session 返回 errcode 不为 0
- **THEN** 系统 SHALL 返回 `{ code: -1, message: "微信登录失败", data: null }`，HTTP 401

#### Scenario: Missing code parameter
- **WHEN** 请求 `POST /api/v1/auth/login`，body 中缺少 code 字段或 code 为空字符串
- **THEN** 系统 SHALL 返回 `{ code: -1, message: "参数错误", data: null }`，HTTP 400

### Requirement: jscode2session integration
系统 SHALL 调用微信 `https://api.weixin.qq.com/sns/jscode2session?appid={APPID}&secret={SECRET}&js_code={CODE}&grant_type=authorization_code` 获取 openid 和 session_key。

#### Scenario: Successful jscode2session call
- **WHEN** 微信 API 返回 `{ openid: "xxx", session_key: "xxx" }`（无 errcode）
- **THEN** 系统 SHALL 使用 openid 查找或创建用户，签发 JWT token

#### Scenario: jscode2session returns error
- **WHEN** 微信 API 返回 `{ errcode: 40029, errmsg: "invalid code" }`
- **THEN** 系统 SHALL 不创建用户，直接返回登录失败错误
