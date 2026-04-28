## 1. 依赖安装与 Auth 配置

- [x] 1.1 安装 `next-auth` 依赖
- [x] 1.2 创建 `src/lib/auth.ts`：NextAuth 配置（Credentials Provider + JWT strategy + 24h session），从 `admins` 表查询用户并 bcrypt 校验密码
- [x] 1.3 创建 `src/app/api/auth/[...nextauth]/route.ts`：导出 NextAuth handlers (GET, POST)

## 2. 路由保护

- [x] 2.1 创建 `src/middleware.ts`：保护所有路由，排除 `/login` 和 `/api/auth/*`，未登录重定向到 `/login`，已登录访问 `/login` 重定向到 `/`

## 3. 登录页面

- [x] 3.1 创建 `src/app/(auth)/login/page.tsx`：独立布局的登录页（居中卡片、用户名 + 密码表单、提交按钮、错误提示）

## 4. Session Provider 集成

- [x] 4.1 在 `src/app/layout.tsx` 中包裹 SessionProvider（客户端组件 wrapper），使 session 信息全局可用

## 5. 顶栏用户信息

- [x] 5.1 修改 `src/components/layout/top-bar.tsx`：显示当前登录用户名，退出登录调用 signOut

## 6. 验证

- [x] 6.1 验证完整流程：未登录 → 跳转登录页 → 登录成功 → 进入首页 → 退出 → 回到登录页
