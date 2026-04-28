## Context

C01 已完成 Next.js 管理后台骨架搭建。现在需要建立数据库访问层，为后续所有业务功能（题库管理、用户管理、认证等）提供数据基础。数据库为腾讯云 PostgreSQL，连接字符串通过 `.env` 文件中的 `DATABASE_URL` 配置。

## Goals / Non-Goals

**Goals:**

- 建立可靠的数据库连接池，支持 Serverless 环境下的连接复用
- 使用 Drizzle ORM 定义类型安全的 schema
- 提供 migration 工作流：生成 SQL diff、执行迁移、查看状态
- 创建用户域四张核心表，与架构文档 4.4 节保持一致
- 提供种子数据脚本插入默认管理员

**Non-Goals:**

- 不实现题库内容表（属于 C04-C07）
- 不实现认证逻辑（属于 C03）
- 不处理数据库分库分表、读写分离等高级部署
- 不做 CI 中的自动 migration 执行

## Decisions

### 1. Drizzle ORM 作为数据库访问层

**选择**: Drizzle ORM + drizzle-kit

**理由**:
- 类型安全，与 TypeScript 深度集成，schema 即类型
- 轻量，无运行时抽象开销，SQL-like API 容易调试
- drizzle-kit 提供声明式 migration：修改 schema 文件 → 自动生成 SQL diff
- 与 EdgeOne Pages Serverless 环境兼容，无连接泄漏问题

**替代方案**:
- Prisma: 更重的运行时，schema 的 .prisma 文件与 TS 割裂，Serverless 下冷启动慢
- 原生 pg + 手写 SQL: 灵活但无类型安全，migration 需要额外工具管理
- Kysely: 类型安全但无内置 migration 工具

### 2. postgres (postgres.js) 作为驱动

**选择**: `postgres` 包（而非 `pg`）

**理由**:
- Drizzle 官方推荐，API 更现代，Promise 原生支持
- 内置连接池和预备语句缓存
- 更小的包体积

### 3. Schema 文件组织

**选择**: 按业务域拆分 schema 文件，统一 barrel export

```
src/lib/schema/
├── users.ts        # users, user_profiles, user_settings
├── admins.ts       # admins
└── index.ts        # barrel export
```

**理由**: 后续 C04-C07 会新增题库域表、C06 新增商品域表等，按域拆分避免单文件膨胀。

### 4. Migration 目录

**选择**: `drizzle/` 目录放在项目根目录（与 `src/` 平级）

**理由**: drizzle-kit 默认约定，与 `drizzle.config.ts` 配置一致。migration 文件是 SQL，不应混入 `src/`。

### 5. 种子数据脚本

**选择**: `scripts/seed.ts`，使用 tsx 直接运行

**理由**: 简单直接，开发阶段快速填充数据。后续可通过 `npm run db:seed` 执行。

## Risks / Trade-offs

- **[Serverless 连接池]** EdgeOne Pages 的 Serverless Functions 可能频繁创建/销毁进程，连接池配置需要设置合理的 max 和 idle timeout → 使用 `postgres` 默认配置（max: 10, idle_timeout: 20s），足够应对初期流量。
- **[Migration 在生产环境]** drizzle-kit 需要直接连接数据库执行 migration → 生产环境通过 `npm run db:migrate` 手动执行或集成到部署脚本，不做自动 migration。
- **[种子数据幂等性]** 种子脚本需要幂等（重复执行不报错）→ 使用 `INSERT ... ON CONFLICT DO NOTHING`。
