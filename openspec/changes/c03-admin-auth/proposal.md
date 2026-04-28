## Why

管理后台包含题库管理、用户管理、订单管理等敏感操作，必须限制为已认证的管理员才能访问。在开始实现业务页面之前，需要先建立完整的认证体系，确保所有管理页面和 API 都受到保护。

## What Changes

- 集成 NextAuth.js v5，使用 Credentials Provider（账号密码登录）
- 创建登录页面 `/login`，包含用户名和密码表单
- 使用 JWT strategy 管理 session（无状态，适配 Serverless）
- 从 `admins` 表查询用户，bcrypt 校验密码
- 路由保护：未登录访问任何管理页面自动跳转 `/login`，API 返回 401
- 顶栏显示当前登录用户名和退出登录功能

## Capabilities

### New Capabilities

- `admin-auth`: 管理后台认证 — NextAuth.js 集成、Credentials 登录、JWT session、路由保护中间件、登录页面

### Modified Capabilities

（无现有 capability 需要修改）

## Impact

- **新增依赖**: `next-auth@5`, `@auth/drizzle-adapter` (可选)
- **新增文件**: `src/app/login/page.tsx`, `src/lib/auth.ts`, `src/app/api/auth/[...nextauth]/route.ts`, `src/middleware.ts`
- **修改文件**: `src/components/layout/top-bar.tsx`（退出登录逻辑）, `src/app/layout.tsx`（session provider）
- **环境变量**: `NEXTAUTH_SECRET`, `NEXTAUTH_URL` 已在 `.env.example` 中定义
