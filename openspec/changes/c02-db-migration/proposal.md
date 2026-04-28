## Why

管理后台和 API 需要访问数据库来管理题库、用户、订单等数据。在实现任何业务功能之前，必须先建立数据库连接和 schema 版本管理机制，确保后续每个 Change 可以安全地增量修改数据库结构。

## What Changes

- 新增数据库连接池模块 `admin/src/lib/db.ts`，从 `.env` 读取 `DATABASE_URL`
- 引入 Drizzle ORM 作为数据库访问层和 migration 工具
- 定义用户相关表的 schema：`users`、`user_profiles`、`user_settings`、`admins`
- 创建 migration 工作流（生成、执行、回滚）
- 提供种子数据脚本，插入默认管理员账号

## Capabilities

### New Capabilities

- `db-connection`: 数据库连接池管理 — 从环境变量读取连接字符串、连接池配置、健康检查
- `db-schema-user`: 用户域数据库 schema — `users`、`user_profiles`、`user_settings`、`admins` 四张表的 Drizzle schema 定义和 migration
- `db-seed`: 种子数据 — 默认管理员账号插入脚本

### Modified Capabilities

（无现有 capability 需要修改）

## Impact

- **新增依赖**: `drizzle-orm`, `drizzle-kit`, `postgres` (或 `pg`)
- **新增文件**: `admin/src/lib/db.ts`, `admin/src/lib/schema/`, `admin/drizzle/`, `admin/scripts/seed.ts`
- **环境变量**: `.env.example` 中已有 `DATABASE_URL`，需实际创建 `.env` 文件
- **数据库**: 需要可用的 PostgreSQL 实例（本地或腾讯云）
