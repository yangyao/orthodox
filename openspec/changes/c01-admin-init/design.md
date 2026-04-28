## Context

当前项目仅包含微信小程序代码 (`miniprogram/`)，没有管理后台。管理后台需要独立部署在 EdgeOne Pages 上，同时提供前端页面和 Serverless API。整个系统架构为：小程序 + Next.js 管理后台 (SSR + API) + 腾讯云 PostgreSQL。

## Goals / Non-Goals

**Goals:**

- 初始化 `admin/` Next.js 项目，使用 App Router
- 集成 shadcn/ui + Tailwind CSS，确保组件可定制
- 实现基础 Layout：可折叠侧边栏 + 顶栏 + 主内容区
- 配置 Next.js 适配 EdgeOne Pages（standalone output 或 @cloudflare/next-on-pages 兼容方案）
- 提供 `.env.example` 模板，列出后续所有依赖的环境变量

**Non-Goals:**

- 不包含数据库连接、ORM 配置（属于 C02）
- 不包含认证逻辑（属于 C03）
- 不包含任何业务页面（题库管理、用户管理等属于 P1 及之后）
- 不处理 EdgeOne Pages 线上部署流程（仅做好构建配置）

## Decisions

### 1. Next.js App Router + Server Components

**选择**: App Router (not Pages Router)

**理由**: App Router 是 Next.js 推荐方案，支持 React Server Components，layout 嵌套更自然，与 shadcn/ui 配合良好。Server Actions 可简化表单提交。

**替代方案**: Pages Router — 更成熟但无 RSC 支持，layout 共享需手动 _app.js，长期维护不如 App Router。

### 2. shadcn/ui 作为 UI 组件库

**选择**: shadcn/ui（copy-paste 模式，非 npm 包）

**理由**: 组件源码直接放入项目，完全可控可定制。基于 Radix UI 原语，无障碍性优秀。Tailwind CSS 原生支持，无额外 CSS-in-JS 运行时。

**替代方案**: Ant Design — 功能丰富但样式定制困难，包体积大，与 Tailwind 配合不佳。

### 3. Layout 结构

**选择**: 左侧固定侧边栏 + 右侧顶栏 + 内容区

**理由**: 管理后台标准布局，侧边栏容纳导航菜单（题库管理、题目管理、用户管理、商品管理、订单管理、统计看板），顶栏显示当前用户和退出按钮。

### 4. EdgeOne Pages 部署适配

**选择**: `output: 'standalone'` + 确保 API Routes 可作为 Serverless Functions 运行

**理由**: EdgeOne Pages 支持 Next.js SSR 模式部署。standalone 输出减少部署体积。后续如需静态导出可调整，但目前 API Routes 需要 serverless 运行时。

### 5. 包管理器

**选择**: pnpm

**理由**: 磁盘空间效率高，monorepo 友好，与小程序端保持一致。后续小程序和管理后台可能用 workspace 共享类型。

## Risks / Trade-offs

- **[EdgeOne Pages 兼容性]** EdgeOne Pages 对 Next.js 的支持可能存在限制（如 middleware、动态路由）→ 先用标准 App Router 写法，遇到不兼容再调整。可在本地 `next dev` 验证后再部署。
- **[shadcn/ui 初始化复杂度]** shadcn/ui init 会修改多个配置文件 → 一次性配置好，后续添加组件用 `npx shadcn add` 即可。
- **[admin/ 独立 package.json]** 小程序和管理后台各自独立依赖 → 使用 pnpm workspace 可能更好，但初期独立管理更简单，后续可合并。
