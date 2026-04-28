## Context

截至 C12 和 C14，系统已经能持久化练习会话、练习答案、错题记录、模考会话和模考答案；这些数据足以支撑学习轨迹页面，但目前还没有统一的统计聚合出口。原型中的“学习轨迹”包含两个 tab：

- 学习记录：展示用户是否学过、最近学习过什么，并在空状态下引导“去逛逛”。
- 学习统计：展示累计数据、按日/周/月切换的学习趋势，以及学习日历热力图。

本 change 的重点是定义统计口径与聚合接口，而不是增加新的业务实体。统计必须尽量基于现有 ledger 型数据实时或准实时计算，避免再造一套不一致的影子表。

## Goals / Non-Goals

**Goals:**
- 聚合练习会话和模考会话，生成统一学习记录流。
- 提供累计统计、周期统计、日历热力图和单题库统计 API。
- 明确各统计指标的首版计算口径，避免前后端各自猜测。
- 支持小程序 `pages/stats` 的双 tab 页面、空状态和基础图表。

**Non-Goals:**
- 不实现后台运营看板；那属于 C24。
- 不引入复杂离线数仓或实时流处理，首版使用 OLTP 库聚合查询。
- 不统计视频课程、资料包下载、直播学习等尚未落地的数据域。
- 不实现导出报表或分享海报。

## Decisions

### 1. 学习记录流统一聚合 `practice_sessions` 与 `exam_sessions`

- `GET /api/v1/learning/records` 返回统一结构的 items，每条记录至少包含：
  - `recordType`: `practice` / `mock_exam`
  - `bankId`, `bankName`
  - `title`
  - `startedAt`, `completedAt`
  - `durationSeconds`
  - `summary`

**为什么这样做:**
- 原型的“学习记录”是时间流，不应该要求前端分别请求练习历史和模考历史再合并。
- 未来即使接入课程学习记录，也能继续往同一 feed 里扩展新 `recordType`。

### 2. 统计口径使用“学习单元”抽象，避免被原型中的‘课程/节’字样绑定死

- 总览与趋势中的核心指标首版定义为：
  - `studyDurationMinutes`: 已完成练习/模考累计时长。
  - `completedUnitsCount`: 已完成学习单元数；当前学习单元来源是完成的练习会话和提交的模考会话。
  - `studyDaysCount`: 有学习行为的去重日期数。
- 前端文案可以继续展示“完成课程/节”，但接口字段保持领域中立。

**为什么这样做:**
- 当前产品真实落地的是题库练习与模考，不是完整课程系统。
- 先把字段定义成可扩展指标，后续接入课程数据时不必推翻 API。

### 3. 趋势图与日历共用一套聚合基础，但拆成单独响应段

- `GET /api/v1/learning/stats/calendar` 支持 `granularity=day|week|month` 和 `anchorDate=YYYY-MM-DD`。
- 返回结构分两部分：
  - `series`: 当前粒度下的趋势点，用于折线图。
  - `calendar`: 指定自然月的每日热力数据，用于日历视图。

**为什么这样做:**
- 原型中的“学习统计”页需要同时渲染趋势和日历。
- 前端一次请求拿到两块统计，能减少页面切换时的重复请求。

### 4. 单题库统计使用当前题库上下文，专注题库学习表现

- `GET /api/v1/learning/stats/banks/:bankId` 返回某题库下的：
  - `answeredQuestionsCount`
  - `correctAnswersCount`
  - `accuracyRate`
  - `practiceSessionCount`
  - `mockExamCount`
  - `totalStudyDurationMinutes`
  - `lastStudiedAt`

**为什么这样做:**
- 用户在设置页里有“当前题库”概念，统计页需要能快速聚焦到单题库视角。
- 这些指标都可以从现有练习/模考表推导，不需要额外冗余表。

### 5. 首版采用数据库聚合查询，不新增预聚合表

- 利用 `practice_sessions`、`practice_answers`、`exam_sessions`、`exam_answers` 做聚合。
- 通过 `user_id + created_at/started_at`、`bank_id + user_id` 索引保障性能。

**为什么这样做:**
- 当前阶段数据量预期可控，过早引入日统计表、materialized view 或后台批处理只会增加复杂度。
- 一旦后续统计查询成为热点，再独立为 C23.x 或 C24 引入预聚合策略更稳。

**备选方案:**
- 新增 `daily_learning_stats` 之类的汇总表。
  - 放弃原因：需要额外同步链路和修数方案，超出当前最小闭环。

## Risks / Trade-offs

- **[Risk] 聚合查询在数据量增长后变慢** → 先保证索引完整，必要时在后续 change 引入预聚合表。
- **[Risk] 练习和模考时长口径不一致** → 统一使用“已完成会话/已交卷会话”的 duration 字段，不直接从逐题答案累加。
- **[Risk] 原型文案与真实题库领域存在偏差** → 接口字段使用通用统计语义，前端文案保留调整空间。
- **[Risk] 空状态页面和有数据页面差异较大** → 在 spec 中显式定义空状态，以免前端实现时遗漏。

## Migration Plan

1. 检查 C10/C13 产生的会话表字段是否足够支持聚合，如缺少 `ended_at`/`duration_seconds` 则在实现时补齐。
2. 为统计查询补索引或优化现有索引。
3. 上线统计 API。
4. 上线小程序 `pages/stats` 双 tab 页面。

回滚策略：
- 若统计 API 性能不佳，可先关闭 `pages/stats` 入口，不影响练习、模考和支付主链路。
- 若某个统计接口口径有误，优先修正聚合 SQL，不删除原始会话数据。

## Open Questions

- “完成课程/节”在题库场景下是否后续统一改文案为“完成学习单元/完成练习”；本 change 先不强制前端改字样。
- 学习记录流是否需要混入钱包充值、资料包领取等非学习事件；当前建议不要，保持纯学习域。
