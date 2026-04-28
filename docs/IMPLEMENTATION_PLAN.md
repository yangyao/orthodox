# 刷题小程序 - 实施规划

> 基于 [ARCHITECTURE.md](./ARCHITECTURE.md)，按依赖关系拆分为多个 OpenSpec Change，每个 Change 控制在 1-3 个工作日内完成。

## 分阶段总览

| 阶段 | 主题 | Changes | 前置依赖 |
|------|------|---------|---------|
| P0 | 项目脚手架 | C01 ~ C03 | 无 |
| P1 | 题库内容域 (Admin) | C04 ~ C07 | C03 |
| P2 | 用户认证、首页与设置 | C08 ~ C09A | C03 |
| P2.5 | 授权与试用访问控制 | C17 | P1 + P2 |
| P3 | 练习核心 (小程序) | C10 ~ C12 | P1 + P2 + P2.5 |
| P4 | 模考系统 | C13 ~ C14 | P3 |
| P5 | 收藏与笔记 | C15 | P3 |
| P6 | 商品与资料包商品化 | C16 + C18 | P3 |
| P7 | 支付与钱包 | C19 ~ C21 | P6 |
| P8 | 激活码 | C22 | P7 |
| P9 | 学习统计与后台看板 | C23 ~ C24 | P3 + P6 + P7 |

---

## P0 - 项目脚手架

### C01: Admin 项目初始化

**目标**: 搭建 Next.js + shadcn/ui 管理后台项目骨架，配置 EdgeOne Pages 部署。

**范围**:
- `admin/` 目录初始化 Next.js (App Router)
- 安装配置 shadcn/ui + Tailwind CSS
- 基础 Layout: 侧边栏导航 + 顶栏 + 内容区
- 配置 EdgeOne Pages 部署 (next.config.ts 适配)
- 环境变量模板 (.env.example)

**产出文件**:
```
admin/
├── app/layout.tsx, page.tsx
├── components/ui/          # shadcn 基础组件
├── lib/utils.ts
├── next.config.ts
├── tailwind.config.ts
├── package.json
└── .env.example
```

**不包含**: 数据库连接、业务逻辑、具体页面。

---

### C02: 数据库连接与 Migration 基础

**目标**: 建立数据库连接池、migration 工作流、基础用户表。

**范围**:
- `admin/lib/db.ts` — 连接池 (使用 postgres 或 drizzle-orm)
- migration 脚本框架 (使用 drizzle-kit 或 node-pg-migrate)
- 建表: `users`, `user_profiles`, `user_settings`
- `admins` 表 (管理后台认证用)
- 种子数据: 插入一个默认管理员

**产出文件**:
```
admin/lib/db.ts
admin/drizzle/              # 或 migrations/
├── 001_users_and_admins.sql
```

---

### C03: 管理后台认证

**目标**: 管理员可登录管理后台。

**范围**:
- NextAuth.js Credentials Provider 配置
- 登录页面 `/admin/login`
- Session 管理 (JWT strategy)
- `admin/lib/auth.ts` — 鉴权中间件/工具函数
- 保护所有 `/admin/*` 路由 (未登录跳转登录页)

---

## P1 - 题库内容域 (Admin)

### C04: 题库分类与题库 CRUD

**目标**: 管理员可以管理题库分类和题库基本信息。

**范围**:
- Admin API: `GET/POST /api/admin/v1/bank-categories`, `GET/PATCH/DELETE /api/admin/v1/bank-categories/:id`
- Admin API: `GET/POST /api/admin/v1/banks`, `GET/PATCH/DELETE /api/admin/v1/banks/:id`
- 建表: `bank_categories`, `question_banks`
- Admin 页面: 分类管理页、题库列表页、题库编辑页
- 状态管理: draft → published → archived

---

### C05: 卷册与章节管理

**目标**: 管理员可在题库下管理卷册和章节树。

**范围**:
- 建表: `bank_editions`, `bank_sections`
- Admin API: 卷册 CRUD、章节树 CRUD (支持 parent_id 层级)
- Admin 页面: 卷册列表页、章节树编辑器 (可拖拽排序 / 树形展开)
- 章节题目数量自动更新

---

### C06: 题目管理 (单题 + 批量导入)

**目标**: 管理员可以逐题添加或批量导入题目。

**范围**:
- 建表: `questions`
- Admin API: `GET/POST /api/admin/v1/banks/:bankId/questions`
- Admin API: `POST /api/admin/v1/banks/:bankId/questions/import` (JSON/Excel)
- Admin 页面: 题目列表页 (分页、按章节/类型/难度筛选)
- Admin 页面: 单题编辑页 (支持单选/多选/判断/填空)
- Admin 页面: 批量导入页 (上传文件 + 预览 + 确认导入)

---

### C07: 模考试卷管理

**目标**: 管理员可以创建和管理模考试卷。

**范围**:
- 建表: `mock_papers`, `mock_paper_questions`
- Admin API: 模考 CRUD、组卷 (从题库选题/随机抽题)
- Admin 页面: 模考列表页、组卷编辑页 (设置时长/分数/选题)

---

## P2 - 用户认证、首页与设置

### C08: 小程序登录与用户 API

**目标**: 小程序用户可以登录，后端完成微信 code → openid → JWT 的完整链路。

**范围**:
- API: `POST /api/v1/auth/login` — 微信 code 换 token
- API: `GET /api/v1/me`, `PATCH /api/v1/me/profile`
- JWT 签发与校验中间件
- 小程序端 `services/auth.ts` — 封装登录逻辑、token 存储
- 小程序端 `services/request.ts` — 统一请求封装 (带 token、错误处理)

---

### C09: 首页与题库目录

**目标**: 小程序首页展示分类 tab、题库列表、题库详情。

**范围**:
- API: `GET /api/v1/home`, `GET /api/v1/bank-categories`, `GET /api/v1/bank-categories/:id/banks`
- API: `GET /api/v1/banks/:bankId`, `GET /api/v1/banks/:bankId/editions`, `GET /api/v1/banks/:bankId/sections`
- 小程序页面重构:
  - 首页 `pages/index` — 分类 tab + 题库卡片列表
  - 题库详情 `pages/bank-detail` — 基本信息 + 卷册/章节树

---

### C09A: 个人中心与设置

**目标**: 小程序用户可以维护做题偏好和个人中心基础信息。

**范围**:
- API: `GET /api/v1/me/settings`, `PATCH /api/v1/me/settings`
- API: `GET /api/v1/me` 扩展为返回订单角标、当前题库、学习入口摘要
- 小程序页面:
  - `pages/profile` — 我的 FOCO 首页
  - `pages/settings` — 设置页
- 设置项至少覆盖:
  - 当前题库
  - 考试日期
  - 随机练习题数
  - 夜间模式
  - 自动下一题
  - 自动保存错题

---

## P2.5 - 授权与试用访问控制

### C17: 题库授权与权益校验

**目标**: 后端可以在练习/模考上线前判断用户是否有权访问某题库，并支持试用章节。

**范围**:
- 建表: `user_bank_entitlements`
- API: `GET /api/v1/banks/:bankId/entitlement` — 查询授权状态
- 授权校验中间件: `practice-sessions`、`exam-sessions`、题库详情接口中统一检查 entitlement
- 试用逻辑: `is_trial` 的卷册/章节/题目无需授权即可访问
- Admin API: `POST /api/admin/v1/users/:userId/entitlements` — 人工补发

**说明**:
- 该 Change 必须先于 C10/C13 完成，避免前台核心入口先天无保护。
- 权益来源先支持 `admin / trial`，后续在支付链路中接入 `purchase / redeem`。

---

## P3 - 练习核心 (小程序)

### C10: 练习会话 API

**目标**: 后端支持创建练习会话、拉题、提交答案、结算统计。

**范围**:
- 建表: `practice_sessions`, `practice_answers`
- API: `POST /api/v1/practice-sessions` — 创建会话 (mode: sequential/random/chapter/wrong-book)
- API: `GET /api/v1/practice-sessions/:sessionId/questions/:questionId`
- API: `POST /api/v1/practice-sessions/:sessionId/answers`
- API: `POST /api/v1/practice-sessions/:sessionId/complete`
- API: `GET /api/v1/practice-history`
- API: `GET /api/v1/wrong-questions`
- 字段补充: `practice_answers.is_marked` 或等价持久化方案，支持答题卡标记状态
- 访问控制: 创建会话与拉题时必须复用 C17 的 entitlement middleware 与 trial 规则

---

### C11: 答题页面 (顺序/随机/章节模式)

**目标**: 小程序内可以开始练习、逐题作答、查看解析。

**范围**:
- 小程序组件: `question-card` (题目展示)、`answer-sheet` (答题卡)
- 小程序页面:
  - `pages/practice` — 答题主页面 (上下滑动切题)
  - `pages/practice-result` — 练习结果统计
- 支持: 顺序/随机/章节三种模式入口
- 答题卡: 跳转指定题、已答/未答/标记状态
- 单题提交后显示解析 (可配置是否自动下一题)
- 标记状态持久化: 前端通过答案保存接口或独立标记接口同步 `is_marked`

---

### C12: 错题集与练习历史

**目标**: 用户可以查看错题和练习历史。

**范围**:
- API: 已在 C10 中完成
- 小程序页面:
  - `pages/wrong-questions` — 错题列表 (按题库分组)
  - `pages/practice-history` — 历史记录列表
- 错题重练: 从错题集发起练习会话 (mode=wrong-book)

---

## P4 - 模考系统

### C13: 模考 API

**目标**: 后端支持模考创建、答题、交卷、成绩计算。

**范围**:
- 建表: `exam_sessions`, `exam_answers`
- API: `GET /api/v1/banks/:bankId/mock-papers`
- API: `POST /api/v1/mock-papers/:paperId/exam-sessions` — 开始模考
- API: `GET /api/v1/exam-sessions/:examSessionId`
- API: `POST /api/v1/exam-sessions/:examSessionId/answers` — 保存进度
- API: `POST /api/v1/exam-sessions/:examSessionId/submit` — 交卷

---

### C14: 模考小程序页面

**目标**: 小程序内可以参加模考、查看成绩。

**范围**:
- 小程序页面:
  - `pages/mock-list` — 某题库下模考试卷列表
  - `pages/exam` — 模考答题页 (倒计时、答题卡)
  - `pages/exam-result` — 成绩单 (总分/各题得分/解析)

---

## P5 - 收藏与笔记

### C15: 收藏与笔记功能

**目标**: 用户可以收藏题目、记录笔记。

**范围**:
- 建表: `user_favorites`, `user_question_notes`
- API: `PUT /api/v1/questions/:questionId/favorite`
- API: `GET/PUT /api/v1/questions/:questionId/note`
- API: `GET /api/v1/favorites`
- 小程序页面: `pages/favorites` — 收藏列表
- 答题页内集成收藏按钮和笔记入口

---

## P6 - 商品与资料包商品化

### C16: 商品与 SKU 管理 (Admin)

**目标**: 管理员可以为题库/资料包创建商品和定价。

**范围**:
- 建表: `catalog_products`, `product_skus`
- Admin API: 商品 CRUD、SKU CRUD
- Admin 页面: 商品列表页、商品编辑页 (关联题库/资料包、设置 SKU 价格和有效期)
- 约束: `catalog_products` 必须支持 `question_bank` 与 `material_pack` 两类关联对象

---

### C18: 资料包

**目标**: 管理员可以管理资料包，用户可以购买/领取并查看已获得的资料包。

**范围**:
- 建表: `material_packs`, `user_material_entitlements`
- Admin API: 资料包 CRUD
- Admin API: 资料包关联商品查询
- API: `GET /api/v1/material-packs`, `GET /api/v1/material-packs/:packId`
- API: `GET /api/v1/products/material-packs/:packId` — 资料包商品页数据
- Admin 页面: 资料包管理页
- 说明资料包交易路径:
  - 资料包作为 `catalog_products/product_skus` 的一种商品类型
  - 可单独下单，复用 C19 ~ C22 的订单、支付、激活码链路
  - 支付或兑换成功后写入 `user_material_entitlements`

---

## P7 - 支付与钱包

### C19: 订单系统

**目标**: 用户可以为题库、资料包、钱包充值创建订单并管理订单。

**范围**:
- 建表: `orders`, `order_items`
- API: `POST /api/v1/orders` — 创建订单 (`orderType: bank/material/recharge`)
- API: `GET /api/v1/orders`, `GET /api/v1/orders/:orderId`
- API: `POST /api/v1/orders/:orderId/cancel`
- 订单超时自动关闭 (可用定时任务或延迟队列)
- Admin API: `GET /api/admin/v1/orders` — 后台订单查看

---

### C20: 微信支付集成

**目标**: 用户可以通过微信支付购买题库或资料包。

**范围**:
- 建表: `payment_transactions`
- API: `POST /api/v1/orders/:orderId/payments/wechat` — 获取支付参数
- 回调: `POST /api/callbacks/wechat/pay` — 微信支付回调处理
- 支付成功后自动发放题库/资料包权益 (事务)
- 幂等处理: 按 `provider_trade_no` 去重

---

### C21: 钱包系统

**目标**: 用户可以充值钱包、使用余额支付。

**范围**:
- 建表: `wallet_accounts`, `wallet_ledger_entries`
- API: `GET /api/v1/wallet`, `GET /api/v1/wallet/ledger`
- API: `POST /api/v1/wallet/recharge-orders` — 充值
- API: `POST /api/v1/orders/:orderId/payments/wallet` — 余额支付
- 余额扣减事务: 先写 ledger → 再更新 balance 快照

---

## P8 - 激活码

### C22: 激活码系统

**目标**: 支持激活码兑换题库或资料包。

**范围**:
- 建表: `activation_codes`, `activation_code_redemptions`
- Admin API: 激活码批次生成、查询
- API: `POST /api/v1/activation-codes/redeem` — 兑换
- API: `POST /api/v1/orders/:orderId/payments/activation-code` — 下单时用激活码支付
- 并发安全: `SELECT FOR UPDATE` 锁定激活码记录
- Admin 页面: 激活码批次管理、核销记录
- 权益发放: 根据激活码绑定的 SKU 类型，写入 `user_bank_entitlements` 或 `user_material_entitlements`

---

## P9 - 学习统计与后台看板

### C23: 学习统计 API 与小程序页面

**目标**: 用户可以查看学习数据。

**范围**:
- API: `GET /api/v1/learning/stats/overview` — 总览
- API: `GET /api/v1/learning/stats/calendar` — 日历热力图
- API: `GET /api/v1/learning/stats/banks/:bankId` — 单题库统计
- API: `GET /api/v1/learning/records` — 学习记录流
- 小程序页面: `pages/stats` — 统计页

---

### C24: 管理后台看板

**目标**: 管理员可以查看运营数据。

**范围**:
- Admin API: `GET /api/admin/v1/dashboard/overview` — GMV、付费用户、活跃数据
- Admin API: `GET /api/admin/v1/dashboard/learning` — 做题量、模考量
- Admin API: `GET /api/admin/v1/dashboard/products` — 题库销量
- Admin 页面: 仪表盘首页 (卡片 + 折线图 + 柱状图)

---

## 依赖关系图

```
C01 ──┐
C02 ──┼── C03 ──┬── C04 ── C05 ── C06 ── C07 ───────────────┐
       │         │                                            │
       │         ├── C08 ── C09 ── C09A ──┐                  │
       │         │                         │                  │
       │         └─────────────────────────▼──────────────────┤
       │                               C17 (授权与试用)       │
       │                                      │               │
       │                           ┌──────────▼──────────┐    │
       │                           │ C10 ── C11 ── C12   │    │
       │                           │   (P3 练习核心)     │    │
       │                           └──┬──────────┬───────┘    │
       │                              │          │            │
       │                       ┌──────▼──┐  ┌───▼────┐        │
       │                       │ C13-C14 │  │  C15   │        │
       │                       │  (模考)  │  │(收藏笔记)│       │
       │                       └────┬────┘  └────────┘        │
       │                            │                         │
       │                      ┌─────▼──────┐                  │
       │                      │ C16 ── C18 │  (商品与资料包)   │
       │                      └─────┬──────┘                  │
       │                            │                         │
       │                      ┌─────▼──────┐                  │
       │                      │ C19 ── C20 │  (订单与支付)    │
       │                      │ └── C21    │  (钱包)          │
       │                      └─────┬──────┘                  │
       │                            │                         │
       │                      ┌─────▼──────┐                  │
       │                      │    C22     │  (激活码)        │
       │                      └────────────┘                  │
       │
       └── C23 (学习统计) ── 依赖 P3
       └── C24 (管理看板) ── 依赖 P6 + P7
```

## 建议执行顺序

```
P0 (C01 → C02 → C03)  →  P1 (C04 → C05 → C06 → C07)
                          P2 (C08 → C09 → C09A)  ←── 可与 P1 并行
                              ↓
                         P2.5 (C17)
                              ↓
                     P3 (C10 → C11 → C12)
                         ↓          ↓
                   P4 (C13-C14)   C15    ←── 可并行
                         ↓
                   P6 (C16 → C18)
                         ↓
                   P7 (C19 → C20 → C21)
                         ↓
                      C22
                         ↓
                   P9 (C23、C24 可并行)
```
