## 1. 安装依赖与配置

- [x] 1.1 安装 drizzle-orm、postgres、drizzle-kit、tsx 依赖
- [x] 1.2 创建 `drizzle.config.ts` 配置文件（指定 schema 路径、migration 输出目录、数据库连接）
- [x] 1.3 在 `package.json` 中添加 npm scripts：`db:generate`、`db:migrate`、`db:studio`、`db:seed`

## 2. Schema 定义

- [x] 2.1 创建 `src/lib/schema/users.ts`：定义 `users`、`user_profiles`、`user_settings` 三张表的 Drizzle schema
- [x] 2.2 创建 `src/lib/schema/admins.ts`：定义 `admins` 表的 Drizzle schema
- [x] 2.3 创建 `src/lib/schema/index.ts`：barrel export 所有表定义

## 3. 数据库连接

- [x] 3.1 创建 `src/lib/db.ts`：初始化 postgres 连接池（max: 10, idle_timeout: 20），导出 Drizzle db 实例，从 `DATABASE_URL` 环境变量读取连接字符串

## 4. Migration 执行

- [x] 4.1 运行 `npm run db:generate` 生成初始 migration SQL 文件
- [x] 4.2 运行 `npm run db:migrate` 在数据库中创建表

## 5. 种子数据

- [x] 5.1 创建 `scripts/seed.ts`：插入默认管理员（username: admin, role: super_admin, bcrypt 密码），使用 `ON CONFLICT DO NOTHING` 保证幂等
- [x] 5.2 运行 `npm run db:seed` 验证种子数据插入成功
