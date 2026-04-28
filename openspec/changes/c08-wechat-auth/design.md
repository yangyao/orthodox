## Context

当前系统有管理后台认证（NextAuth + admins 表），但小程序用户端尚无登录机制。`users`、`user_profiles`、`user_settings` 表已由 C02 创建，但从未写入过数据。小程序端目前是脚手架状态，`services/` 目录为空。

管理后台和用户端共享同一个 Next.js 部署实例，API 路由并行：管理端 `/api/admin/v1/`，用户端 `/api/v1/`。

## Goals / Non-Goals

**Goals:**
- 完成微信小程序 code → openid → JWT 完整链路
- 提供用户资料查询和更新 API
- 小程序端统一请求封装，后续所有 API 调用都走这套机制
- JWT 中间件可复用于后续所有 `/api/v1/` 路由

**Non-Goals:**
- 不做 refresh token 机制（小程序场景 token 过期直接重新 wx.login 即可）
- 不做手机号绑定（后续 C09+ 再做）
- 不做 user_settings 的读写 API（留到 C09）
- 不做 admin 端用户管理页面（留到后续 change）

## Decisions

### D1: JWT 库选 jose 而非 jsonwebtoken

**选择**: `jose`（Web Crypto API 原生实现）
**理由**:
- EdgeOne Pages / Next.js Edge Runtime 不支持 Node.js `crypto` 模块，`jsonwebtoken` 无法在 edge 环境运行
- `jose` 是纯 Web Crypto API 实现，兼容所有 runtime
- Next.js 官方文档也推荐 jose

### D2: Token 策略 — 单 access_token，有效期 7 天

**选择**: 单 token，7 天有效期，过期后重新 `wx.login()`
**理由**:
- 小程序场景下用户无感知登录（`wx.login` 是静默调用），不需要 refresh token 的用户体验优化
- 7 天足够覆盖正常使用周期，过期后自动重新登录即可

### D3: JWT payload 只存 userId

**选择**: `{ sub: userId, iat, exp }`
**理由**:
- 最小化 token 体积，避免泄露业务信息
- 用户角色、权限等后续按需从 DB 查询

### D4: 鉴权中间件用 helper 函数而非 Next.js middleware

**选择**: 在每个 API route 中调用 `authenticateUser(request)` helper
**理由**:
- Next.js middleware 对 body 消耗有限制，且当前 middleware 已用于 admin auth
- helper 函数更灵活，可以在不同路由中按需使用
- 保持 admin auth（NextAuth）和 user auth（JWT）完全解耦

### D5: 微信 jscode2session 用标准 fetch 调用

**选择**: 直接用 `fetch` 调用微信 `https://api.weixin.qq.com/sns/jscode2session`
**理由**:
- 接口简单，只需一次 GET 请求，无需引入 SDK
- 减少依赖

### D6: 小程序端 token 存 wx.setStorageSync

**选择**: `wx.setStorageSync('access_token', token)`
**理由**:
- 小程序本地存储上限 10MB，token 只占几百字节
- 同步读写简单可靠，与小程序生命周期匹配

## Risks / Trade-offs

- **[微信 API 调用失败]** → 后端 `jscode2session` 可能因网络或配置问题失败。方案：返回明确错误码，小程序端提示用户重试，不重试自动无限循环
- **[JWT_SECRET 泄露]** → token 可被伪造。方案：环境变量管理，不提交代码仓库。生产环境使用强随机密钥
- **[openid 查询性能]** → 每次 login 都要查 users 表。方案：openid 字段已有 unique 索引，查询 O(1)
- **[小程序 appid/secret 配置]** → 开发环境需要配置测试号。方案：.env.local 管理，提供清晰文档
