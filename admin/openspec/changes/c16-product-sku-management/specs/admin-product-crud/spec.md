## ADDED Requirements

### Requirement: Product list API
系统 SHALL 提供 `GET /api/admin/v1/products` 接口，返回商品列表，支持分页和筛选。

#### Scenario: List all products with pagination
- **WHEN** 请求 `GET /api/admin/v1/products?page=1&pageSize=20`
- **THEN** 系统 SHALL 返回 `{ code: 0, data: { items: [...], page: 1, pageSize: 20, total: N } }`，每个 item 包含 id, productType, refId, title, coverUrl, status, createdAt

#### Scenario: Filter by product type
- **WHEN** 请求 `GET /api/admin/v1/products?productType=bank`
- **THEN** 系统 SHALL 只返回 product_type 为 "bank" 的商品

#### Scenario: Filter by status
- **WHEN** 请求 `GET /api/admin/v1/products?status=active`
- **THEN** 系统 SHALL 只返回 status 为 "active" 的商品

#### Scenario: Search by keyword
- **WHEN** 请求 `GET /api/admin/v1/products?keyword=建筑`
- **THEN** 系统 SHALL 返回 title 包含"建筑"的商品

### Requirement: Create product API
系统 SHALL 提供 `POST /api/admin/v1/products` 接口，创建新商品。

#### Scenario: Create a bank product
- **WHEN** 请求 `POST /api/admin/v1/products`，body 为 `{ "productType": "bank", "refId": 1, "title": "某题库年度会员", "status": "active" }`
- **THEN** 系统 SHALL 验证 refId=1 对应的 question_bank 存在，创建商品记录，返回 `{ code: 0, data: { id, productType, refId, title, ... } }`

#### Scenario: Create with non-existent bank
- **WHEN** 请求创建 bank 类型商品，refId 指向不存在的题库
- **THEN** 系统 SHALL 返回 `{ code: -1, message: "关联题库不存在" }`，HTTP 400

#### Scenario: Duplicate product for same bank
- **WHEN** 请求创建 bank 类型商品，但该 refId 已有 active 状态的商品
- **THEN** 系统 SHALL 允许创建（同一题库可以有多个商品，如"月卡"和"年卡"）

#### Scenario: Missing required fields
- **WHEN** 请求 body 缺少 productType 或 refId 或 title
- **THEN** 系统 SHALL 返回参数校验错误，HTTP 400

### Requirement: Get single product API
系统 SHALL 提供 `GET /api/admin/v1/products/[productId]` 接口，返回商品详情及关联的 SKU 列表。

#### Scenario: Get product with SKUs
- **WHEN** 请求 `GET /api/admin/v1/products/1`
- **THEN** 系统 SHALL 返回商品详情及关联的所有 SKU 列表，SKU 按 price_fen 升序排列

#### Scenario: Product not found
- **WHEN** 请求不存在的 productId
- **THEN** 系统 SHALL 返回 404

### Requirement: Update product API
系统 SHALL 提供 `PATCH /api/admin/v1/products/[productId]` 接口，更新商品信息。

#### Scenario: Update title and status
- **WHEN** 请求 `PATCH /api/admin/v1/products/1`，body 为 `{ "title": "新标题", "status": "inactive" }`
- **THEN** 系统 SHALL 更新对应字段并返回更新后的商品

### Requirement: Delete product API
系统 SHALL 提供 `DELETE /api/admin/v1/products/[productId]` 接口，软删除商品。

#### Scenario: Delete a product
- **WHEN** 请求 `DELETE /api/admin/v1/products/1`
- **THEN** 系统 SHALL 将 status 设为 "archived"（软删除），返回更新后的商品

#### Scenario: Delete non-existent product
- **WHEN** 请求删除不存在的 productId
- **THEN** 系统 SHALL 返回 404

### Requirement: Product list page
系统 SHALL 提供商品列表管理页面 `/products`。

#### Scenario: View product list
- **WHEN** 管理员访问 `/products`
- **THEN** 页面 SHALL 展示商品表格（标题、类型、关联题库名、状态、SKU 数量、操作按钮），支持分页、按类型/状态筛选

#### Scenario: Navigate to create product
- **WHEN** 管理员点击"新建商品"按钮
- **THEN** 页面 SHALL 跳转到 `/products/new`

#### Scenario: Navigate to edit product
- **WHEN** 管理员点击某商品的"编辑"按钮
- **THEN** 页面 SHALL 跳转到 `/products/[productId]/edit`

### Requirement: Product edit page
系统 SHALL 提供商品编辑页面 `/products/[productId]/edit`，展示商品信息和内嵌 SKU 管理。

#### Scenario: View product with SKUs
- **WHEN** 管理员访问 `/products/1/edit`
- **THEN** 页面 SHALL 展示商品基本信息（可编辑）和 SKU 列表表格

#### Scenario: Create new product
- **WHEN** 管理员访问 `/products/new`
- **THEN** 页面 SHALL 展示空白商品表单，提交后跳转到编辑页
