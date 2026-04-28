## 1. 项目初始化

- [x] 1.1 在项目根目录创建 `admin/` 并用 `create-next-app` 初始化 Next.js 项目 (App Router + TypeScript + Tailwind CSS + npm)
- [x] 1.2 配置 `next.config.ts`：设置 `output: 'standalone'` 适配 EdgeOne Pages 部署
- [x] 1.3 配置 `tsconfig.json`：启用 strict mode，配置路径别名 `@/` 指向 `src/` 或根目录

## 2. shadcn/ui 集成

- [x] 2.1 运行 `npx shadcn@latest init` 初始化 shadcn/ui 配置 (components.json, lib/utils.ts, CSS variables)
- [x] 2.2 添加基础 shadcn/ui 组件：`button`, `avatar`, `dropdown-menu`, `separator`, `sheet`, `tooltip`

## 3. Layout 实现

- [x] 3.1 创建 `app/layout.tsx`：全局字体、CSS 变量、根 html/body 结构
- [x] 3.2 创建 `components/layout/sidebar.tsx`：左侧导航栏，包含菜单项（仪表盘、题库管理、题目管理、模考管理、商品管理、订单管理、用户管理、统计看板）和图标
- [x] 3.3 创建 `components/layout/top-bar.tsx`：顶栏，包含用户头像占位和退出按钮
- [x] 3.4 创建 `components/layout/admin-layout.tsx`：组合 sidebar + top-bar + main content area 的完整布局组件
- [x] 3.5 在 `app/layout.tsx` 或 `app/(dashboard)/layout.tsx` 中使用 AdminLayout 包裹页面

## 4. 首页占位

- [x] 4.1 创建 `app/page.tsx`：显示"刷题管理后台"标题和欢迎信息的仪表盘占位页

## 5. 配置与模板

- [x] 5.1 创建 `.env.example`：列出 DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, WECHAT_APPID, WECHAT_SECRET 并附带注释说明
- [x] 5.2 验证 `pnpm dev` 和 `pnpm build` 均可正常运行
