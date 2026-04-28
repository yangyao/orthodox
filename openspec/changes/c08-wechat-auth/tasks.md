## 1. JWT 工具

- [x] 1.1 安装 `jose` 依赖
- [x] 1.2 创建 `src/lib/jwt.ts`：`signToken(userId)` 和 `verifyToken(token)` 函数
- [x] 1.3 创建 `src/lib/user-auth.ts`：`authenticateUser(request)` helper（提取 Bearer token → 验证 → 返回 userId 或 401 error）

## 2. 微信登录 API

- [x] 2.1 创建 `POST /api/v1/auth/login`：接收 code → 调用 jscode2session → 查找或创建 user + profile + settings → 签发 JWT 返回
- [x] 2.2 添加环境变量：`WECHAT_APPID`、`WECHAT_SECRET`、`JWT_SECRET` 到 `.env.example` 和 `.env.local`

## 3. 用户资料 API

- [x] 3.1 创建 `GET /api/v1/me`：authenticateUser 鉴权 → 查询 users + user_profiles → 返回用户信息
- [x] 3.2 创建 `PATCH /api/v1/me/profile`：authenticateUser 鉴权 → Zod 校验 → 更新 user_profiles 记录

## 4. 小程序端请求封装

- [x] 4.1 创建 `miniprogram/services/request.ts`：封装 wx.request，自动携带 Bearer token，401 自动 re-login 重试，统一错误处理
- [x] 4.2 创建 `miniprogram/services/auth.ts`：`silentLogin()` 函数（wx.login → POST /api/v1/auth/login → 存 token），`getToken()` 函数

## 5. 验证

- [x] 5.1 `npm run build` 验证 admin 项目通过
