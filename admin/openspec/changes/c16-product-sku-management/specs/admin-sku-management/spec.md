## ADDED Requirements

### Requirement: SKU list under product
商品编辑页 SHALL 内嵌展示该商品所有 SKU 的表格。

#### Scenario: Display SKU table
- **WHEN** 管理员进入商品编辑页，商品有 3 个 SKU
- **THEN** 页面 SHALL 展示 SKU 表格，列包含：SKU 编码、标题、价格（元）、原价（元）、有效期（天）、支付方式开关、状态、操作

### Requirement: Create SKU API
系统 SHALL 提供 `POST /api/admin/v1/products/[productId]/skus` 接口，为指定商品添加 SKU。

#### Scenario: Add a single SKU
- **WHEN** 请求 `POST /api/admin/v1/products/1/skus`，body 为 `{ "title": "月度会员", "priceFen": 2900, "originalPriceFen": 3900, "validityDays": 30, "wechatPayEnabled": true, "walletPayEnabled": true, "activationEnabled": false }`
- **THEN** 系统 SHALL 自动生成 sku_code（如 `SKU-{productId}-{timestamp}`），创建 SKU 记录并返回

#### Scenario: SKU with duplicate sku_code
- **WHEN** 系统生成的 sku_code 与已有记录冲突
- **THEN** 系统 SHALL 重试生成直到唯一（概率极低，timestamp 精确到毫秒）

#### Scenario: Price validation
- **WHEN** priceFen 为负数或 0
- **THEN** 系统 SHALL 返回参数校验错误

### Requirement: Update SKU API
系统 SHALL 提供 `PATCH /api/admin/v1/products/[productId]/skus/[skuId]` 接口，更新 SKU 信息。

#### Scenario: Update SKU price
- **WHEN** 请求 `PATCH /api/admin/v1/products/1/skus/5`，body 为 `{ "priceFen": 1990 }`
- **THEN** 系统 SHALL 更新 SKU 价格并返回

#### Scenario: Disable payment method
- **WHEN** 请求更新 `{ "wechatPayEnabled": false }`
- **THEN** 系统 SHALL 更新对应支付方式开关

### Requirement: Delete SKU API
系统 SHALL 提供 `DELETE /api/admin/v1/products/[productId]/skus/[skuId]` 接口，删除 SKU。

#### Scenario: Delete a SKU
- **WHEN** 请求 `DELETE /api/admin/v1/products/1/skus/5`
- **THEN** 系统 SHALL 永久删除该 SKU 记录

#### Scenario: Delete SKU from wrong product
- **WHEN** 请求删除的 skuId 不属于该 productId
- **THEN** 系统 SHALL 返回 404

### Requirement: SKU inline management on edit page
商品编辑页 SHALL 支持 SKU 的行内添加、编辑和删除操作。

#### Scenario: Add SKU inline
- **WHEN** 管理员在 SKU 表格下方点击"添加 SKU"按钮
- **THEN** 页面 SHALL 显示 SKU 表单（标题、价格、原价、有效期、支付方式开关），提交后调用创建 API 并刷新列表

#### Scenario: Edit SKU inline
- **WHEN** 管理员点击某 SKU 行的"编辑"按钮
- **THEN** 该行 SHALL 变为可编辑状态（或弹出编辑 Dialog），修改后保存

#### Scenario: Delete SKU with confirmation
- **WHEN** 管理员点击某 SKU 行的"删除"按钮
- **THEN** 页面 SHALL 弹出确认对话框，确认后调用删除 API
