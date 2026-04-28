## Context

题库内容管理（C04-C07）已完成，系统有 719+ 道题目和模考试卷。现在是 P6 阶段第一步：将题库商品化。需要创建商品（SPU）和规格（SKU）数据模型，以及管理后台的 CRUD 界面。

现有架构：
- Admin 使用 Drizzle ORM + postgres.js，API 统一 `/api/admin/v1/` 前缀
- 列表页模式：客户端组件 + fetch + 分页表格
- 编辑页模式：Dialog 或独立页面 + 表单 + Zod 校验
- `question_banks` 表已有 `status` 字段（draft/published/archived）

## Goals / Non-Goals

**Goals:**
- 管理员能为已发布的题库创建商品，设定不同 SKU 价格和有效期
- 商品支持 bank 和 material 两种类型（当前只实现 bank，material 预留接口）
- SKU 支持独立控制微信支付、钱包支付、激活码三种支付方式开关
- 商品列表页支持按类型和状态筛选

**Non-Goals:**
- 不做前台商品展示（C09 负责）
- 不做订单/支付流程（C19-C21）
- 不做资料包管理（C18）
- 不做库存管理（SKU 为虚拟商品，无库存概念）

## Decisions

### D1: 商品与题库/资料包多态关联

**选择**: `catalog_products` 使用 `product_type + ref_id` 多态关联，不使用独立的外键列
**理由**:
- 架构文档已定义此模式（product_type: bank/material → ref_id 关联 question_banks 或 material_packs）
- 避免多个 nullable FK 列，表结构更简洁
- 查询时 JOIN 由应用层根据 product_type 决定

### D2: SKU 价格以"分"为单位存储

**选择**: `price_fen` (INT) 和 `original_price_fen` (INT)，单位为分
**理由**:
- 避免浮点精度问题，支付系统标准做法
- 与后续订单/支付系统保持一致

### D3: 商品编辑用独立页面而非 Dialog

**选择**: `/products/[productId]/edit` 独立页面
**理由**:
- 商品编辑包含 SKU 列表管理，内容较多，Dialog 空间不够
- 与题库编辑页 `/banks/[bankId]/edit` 模式一致

### D4: SKU 在商品编辑页内嵌管理

**选择**: 商品编辑页内展示 SKU 表格 + 行内添加/编辑/删除
**理由**:
- SKU 是商品的子资源，不适合独立页面
- 行内编辑操作更流畅，减少页面跳转

## Risks / Trade-offs

- **[多态关联无外键约束]** → ref_id 不指向具体表，无法使用数据库级 FK。方案：应用层在创建商品时验证 ref_id 对应的题库/资料包存在
- **[sku_code 唯一性]** → sku_code 需全局唯一。方案：使用数据库 UNIQUE 约束 + 前端提示
- **[商品删除影响]** → 如果已有用户购买了该商品的 SKU，删除会影响权益。方案：商品删除改为软删除（status: archived），已有订单不受影响
