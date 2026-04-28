## Why

目前系统只有管理后台的认证（NextAuth + admins 表），小程序用户端没有登录机制。小程序端后续所有功能（练习、模考、收藏、订单）都依赖用户身份，因此需要率先完成微信登录链路：小程序 `wx.login()` → 后端 `jscode2session` 换取 openid → 签发 JWT → 后续请求携带 token 鉴权。

## What Changes

- 新增 `POST /api/v1/auth/login` 接口：接收微信 code，调用微信 `jscode2session` 获取 openid，查询或创建 user，签发 JWT 返回
- 新增 `GET /api/v1/me` 接口：返回当前用户基本信息 + profile
- 新增 `PATCH /api/v1/me/profile` 接口：更新昵称、头像等资料
- 新增 JWT 签发与校验工具（`lib/jwt.ts`）
- 新增小程序端请求封装（`services/request.ts`）：统一 Bearer token、错误处理、401 自动重新登录
- 新增小程序端登录服务（`services/auth.ts`）：封装 `wx.login` + 后端登录、token 持久化存储

## Capabilities

### New Capabilities
- `wechat-login`: 微信小程序登录链路 — 后端接收 code 换取 openid，签发 JWT，查询或创建用户
- `user-profile-api`: 用户资料 API — GET /me 获取当前用户信息，PATCH /me/profile 更新资料
- `miniprogram-request`: 小程序端请求封装 — 统一 HTTP 请求层，自动携带 token，401 重登，错误处理
- `jwt-middleware`: JWT 签发与校验 — 签发 access_token，中间件校验 Bearer token，提取 userId

### Modified Capabilities
（无，C08 不改变已有 admin 端功能的 spec）

## Impact

- **数据库**: `users` 和 `user_profiles` 表已由 C02 创建，C08 仅读写，无 schema 变更
- **API 路由**: 新增 `/api/v1/` 前缀路由（与 `/api/admin/v1/` 并行），新增 `/api/v1/auth/login`、`/api/v1/me`、`/api/v1/me/profile`
- **依赖**: 需新增 `jose`（或 `jsonwebtoken`）库用于 JWT 签发/校验；需要微信小程序 `appid` 和 `secret` 配置
- **小程序代码**: `miniprogram/services/` 目录新增 `request.ts` 和 `auth.ts`
- **环境变量**: `WECHAT_APPID`、`WECHAT_SECRET`、`JWT_SECRET`
