## ADDED Requirements

### Requirement: Wallet summary API
系统 SHALL 提供 `GET /api/v1/wallet` 接口，返回当前用户钱包余额、可用充值档位和快捷入口信息。

#### Scenario: Authenticated user views wallet summary
- **WHEN** 请求 `GET /api/v1/wallet`，携带有效 Bearer token
- **THEN** 系统 SHALL 返回 `{ code: 0, data: { balanceFen, balanceDisplay, rechargeOptions: [...], ledgerEntryCount } }`

#### Scenario: First-time user with no wallet row
- **WHEN** 新用户首次请求 `GET /api/v1/wallet`，数据库中还不存在 wallet_accounts 记录
- **THEN** 系统 SHALL 自动创建余额为 0 的钱包账户，并返回空余额数据

#### Scenario: Unauthenticated request
- **WHEN** 请求 `GET /api/v1/wallet` 未携带有效 token
- **THEN** 系统 SHALL 返回 HTTP 401

### Requirement: Wallet ledger API
系统 SHALL 提供 `GET /api/v1/wallet/ledger` 接口，分页返回当前用户钱包账单明细。

#### Scenario: View ledger entries
- **WHEN** 请求 `GET /api/v1/wallet/ledger?page=1&pageSize=20`
- **THEN** 系统 SHALL 返回 `{ code: 0, data: { items: [...], page, pageSize, total } }`，每个 item 至少包含 `entryType`、`direction`、`amountFen`、`balanceAfterFen`、`remark`、`createdAt`

#### Scenario: Ledger ordered by newest first
- **WHEN** 用户查看账单明细
- **THEN** 系统 SHALL 按 `createdAt desc` 返回流水记录

#### Scenario: Empty ledger
- **WHEN** 用户尚无任何钱包流水
- **THEN** 系统 SHALL 返回空列表而不是错误

### Requirement: Wallet pages in mini-program
小程序 SHALL 提供钱包首页和账单明细页，消费上述钱包接口展示数据。

#### Scenario: View wallet page
- **WHEN** 用户进入 `pages/wallet`
- **THEN** 页面 SHALL 展示当前余额、固定充值档位、“立即充值”按钮和“账单”入口

#### Scenario: View empty ledger page
- **WHEN** 用户进入 `pages/wallet-ledger` 且账单为空
- **THEN** 页面 SHALL 展示“暂无相关记录”空状态
