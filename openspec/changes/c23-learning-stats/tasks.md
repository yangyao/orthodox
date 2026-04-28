## 1. 数据聚合准备

- [x] 1.1 盘点 `practice_sessions`、`practice_answers`、`exam_sessions`、`exam_answers` 的可用统计字段，补足 `duration`、完成时间等缺失字段
- [x] 1.2 为学习统计查询补充必要索引，至少覆盖 `user_id + started_at/completed_at` 与 `user_id + bank_id`
- [x] 1.3 抽取学习统计聚合 helper，统一练习与模考的聚合逻辑和统计口径

## 2. 学习记录与统计 API

- [x] 2.1 创建 `GET /api/v1/learning/records`：分页返回混合学习记录流
- [x] 2.2 创建 `GET /api/v1/learning/stats/overview`：返回累计统计和当前周期摘要
- [x] 2.3 创建 `GET /api/v1/learning/stats/calendar`：支持 `granularity=day|week|month` 和 `anchorDate`
- [x] 2.4 创建 `GET /api/v1/learning/stats/banks/[bankId]`：返回单题库统计摘要
- [x] 2.5 为无数据用户补齐 0 值返回和空列表返回，避免前端额外兜底

## 3. 小程序页面与服务

- [x] 3.1 创建或重构 `services/learning.ts`：封装学习记录与统计请求
- [x] 3.2 实现 `pages/stats`：双 tab 结构（学习记录 / 学习统计）
- [x] 3.3 在“学习记录”tab 中实现列表与空状态 CTA
- [x] 3.4 在“学习统计”tab 中实现累计卡片、日/周/月切换、趋势图和学习日历
- [x] 3.5 将当前题库上下文接入统计页，按需调用单题库统计接口

## 4. 验证

- [x] 4.1 覆盖关键统计用例：无数据、仅练习数据、练习 + 模考混合数据、跨天统计、单题库统计
- [x] 4.2 验证日/周/月切换与日历月份切换结果正确
- [x] 4.3 `npm run build` 验证通过
