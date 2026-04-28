## Context

C01 搭建了管理后台骨架（Layout + 侧边栏 + 顶栏），C02 创建了 `admins` 表并插入了默认管理员 (admin / admin123)。现在需要将认证系统接入，让管理后台只有登录后才能使用。

## Goals / Non-Goals

**Goals:**

- 管理员通过用户名 + 密码登录
- 所有管理页面和 API 路由受保护，未登录跳转登录页
- JWT 无状态 session，适配 EdgeOne Pages Serverless 环境
- 顶栏显示当前用户并支持退出登录

**Non-Goals:**

- 不实现微信小程序用户认证（属于 C08）
- 不实现注册、忘记密码功能（管理员通过 seed 脚本或后台创建）
- 不做 OAuth 第三方登录
- 不做细粒度 RBAC 权限控制（super_admin / admin 角色区分在后续迭代）

## Decisions

### 1. NextAuth.js v5 (Auth.js)

**选择**: NextAuth.js v5，Credentials Provider

**理由**:
- 与 Next.js App Router 深度集成，支持 Server Actions
- JWT strategy 无需服务端 session 存储，适合 Serverless
- Credentials Provider 支持自定义验证逻辑，可对接 `admins` 表

**替代方案**:
- 自写 JWT 中间件：灵活但需要处理 token 刷新、CSRF 等安全细节
- Lucia Auth：轻量但社区较小，Next.js 集成不如 NextAuth 成熟

### 2. JWT Strategy (无状态 Session)

**选择**: JWT 存储在 httpOnly cookie 中

**理由**:
- 无需数据库存储 session，减少一次 DB 查询
- Serverless 环境友好，每个请求自带认证信息
- NextAuth 默认方案，成熟稳定

### 3. 路由保护方式

**选择**: Next.js middleware (`src/middleware.ts`)

**理由**:
- 在 Edge 层拦截请求，未登录直接重定向，不经过页面渲染
- 统一保护所有 `/` 路径（排除 `/login` 和 `/api/auth/*`）
- 不需要在每个页面单独写鉴权逻辑

### 4. 登录页独立 Layout

**选择**: 登录页 `/login` 不使用 AdminLayout（无侧边栏/顶栏），单独居中卡片布局

**理由**: 登录页应该是独立的、干净的，不需要导航栏等管理后台元素。

## Risks / Trade-offs

- **[JWT 无法主动失效]** JWT 签发后无法服务端撤销 → 设置较短的过期时间（24h），管理后台场景可接受。
- **[Credentials Provider 安全性]** 密码直接发送到服务器 → 确保全链路 HTTPS（EdgeOne 自动提供），登录接口做简单限流。
- **[NextAuth v5 稳定性]** v5 仍在 beta/RC 阶段 → 使用最新稳定版，API 已趋于稳定。
