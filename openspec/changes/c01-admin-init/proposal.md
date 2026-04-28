## Why

刷题小程序需要一个管理后台来管理题库内容、商品、用户和运营数据。管理后台是整个系统的运营入口，必须先搭建好项目骨架，后续所有题库管理 (P1)、商品管理 (P6)、运营看板 (P9) 功能才能在此基础上构建。选择 Next.js + shadcn/ui 是因为可以同时提供 SSR 页面和 Serverless API，部署在 EdgeOne Pages 上实现前后端一体化。

## What Changes

- 在项目根目录新建 `admin/` 目录，初始化 Next.js (App Router) 项目
- 集成 shadcn/ui 组件库 + Tailwind CSS 样式方案
- 实现管理后台基础 Layout：侧边栏导航 + 顶栏（用户信息/退出）+ 内容区
- 配置 Next.js 适配 EdgeOne Pages 部署（静态导出 + serverless functions）
- 创建环境变量模板 `.env.example`（数据库连接、密钥等）
- 添加基础开发工具配置（ESLint、TypeScript strict mode）

## Capabilities

### New Capabilities

- `admin-shell`: 管理后台项目骨架 — Next.js 初始化、shadcn/ui 集成、基础 Layout（侧边栏 + 顶栏 + 内容区）、EdgeOne Pages 部署配置

### Modified Capabilities

（无现有 capability 需要修改）

## Impact

- **新增目录**: `admin/` 整个目录（约 20+ 文件）
- **新增依赖**: next, react, react-dom, tailwindcss, @shadcn/ui 相关包, lucide-react 图标
- **部署**: EdgeOne Pages 需要配置 `admin/` 子项目构建
- **无破坏性变更**: 不影响现有小程序代码
