# 藍新金流串接規劃文件

## 專案概述

本文件規劃 Wellmade 電商平台與藍新金流的整合方案，支援信用卡支付和 LINE Pay 兩種付款方式。

## 系統現況分析

### 已完成部分
- 完整的購物車系統（支援訪客/會員）
- 前端結帳介面（模擬狀態）
- 用戶認證系統（JWT + Google OAuth）
- 產品與變體管理系統

### 待實作部分
- 訂單管理系統
- 金流整合模組
- 訂單狀態追蹤
- 金流回調處理

## 實作階段規劃

### 第一階段：建立訂單系統基礎（優先級：高）

#### 1.1 訂單模組架構
```
backend/src/orders/
├── orders.module.ts
├── orders.controller.ts
├── orders.service.ts
├── entities/
│   ├── order.entity.ts
│   └── order-item.entity.ts
└── dto/
    ├── create-order.dto.ts
    └── update-order.dto.ts
```

#### 1.2 資料庫表設計

**orders 表**
```sql
- id: UUID (Primary Key)
- order_number: string (unique, 格式: ORD-YYYYMMDD-XXXXX)
- user_id: UUID (Foreign Key, nullable for guest)
- status: enum ('pending', 'processing', 'paid', 'shipped', 'delivered', 'cancelled', 'refunded')
- payment_status: enum ('pending', 'paid', 'failed', 'refunded')
- payment_method: string ('credit_card', 'line_pay')
- subtotal: decimal
- shipping_fee: decimal
- total: decimal
- customer_info: JSONB {name, email, phone, address}
- notes: text
- created_at: timestamp
- updated_at: timestamp
```

**order_items 表**
```sql
- id: UUID (Primary Key)
- order_id: UUID (Foreign Key)
- product_id: UUID (Foreign Key)
- variant_id: UUID (Foreign Key, nullable)
- quantity: integer
- price: decimal (價格快照)
- specs: JSONB (規格快照)
- created_at: timestamp
```

**payment_records 表**
```sql
- id: UUID (Primary Key)
- order_id: UUID (Foreign Key)
- transaction_id: string (藍新交易編號)
- payment_method: string
- amount: decimal
- status: enum ('pending', 'success', 'failed', 'refunded')
- request_data: JSONB (加密儲存)
- response_data: JSONB
- error_message: text
- created_at: timestamp
- updated_at: timestamp
```

#### 1.3 環境變數配置
```env
# 藍新金流設定
NEWEBPAY_MERCHANT_ID=你的商店代號
NEWEBPAY_HASH_KEY=你的 HashKey
NEWEBPAY_HASH_IV=你的 HashIV
NEWEBPAY_API_URL=https://ccore.newebpay.com/MPG/mpg_gateway
NEWEBPAY_RETURN_URL=https://your-domain.com/api/payment/return
NEWEBPAY_NOTIFY_URL=https://your-domain.com/api/payment/notify
NEWEBPAY_CLIENT_BACK_URL=https://your-domain.com/checkout/result

# 開發環境使用測試網址
# NEWEBPAY_API_URL=https://ccore.newebpay.com/MPG/mpg_gateway
```

### 第二階段：金流模組開發（優先級：高）

#### 2.1 Payment 模組結構
```
backend/src/payment/
├── payment.module.ts
├── payment.controller.ts
├── payment.service.ts
├── newebpay/
│   ├── newebpay.service.ts
│   ├── newebpay.types.ts
│   └── newebpay.utils.ts
├── dto/
│   ├── create-payment.dto.ts
│   └── payment-callback.dto.ts
└── guards/
    └── payment-signature.guard.ts
```

#### 2.2 藍新金流 API 整合

**信用卡支付流程**
1. 建立訂單並產生交易資料
2. 加密交易資料（AES + SHA256）
3. 導向藍新付款頁面
4. 接收付款結果通知
5. 更新訂單狀態

**LINE Pay 流程**
1. 建立訂單並設定 LINE Pay 參數
2. 透過藍新 MPG API 啟動 LINE Pay
3. 用戶完成 LINE Pay 授權
4. 接收回調並確認付款
5. 更新訂單狀態

#### 2.3 核心功能實作

**加密工具類別**
```typescript
// newebpay.utils.ts
export class NewebpayUtils {
  // AES 加密
  static encrypt(data: string, key: string, iv: string): string
  
  // SHA256 雜湊
  static hash(data: string, key: string, iv: string): string
  
  // 驗證回調簽章
  static verifyCallback(data: any, key: string, iv: string): boolean
}
```

**支付服務介面**
```typescript
// newebpay.service.ts
export class NewebpayService {
  // 建立信用卡付款
  createCreditCardPayment(order: Order): PaymentData
  
  // 建立 LINE Pay 付款
  createLinePayPayment(order: Order): PaymentData
  
  // 處理付款回調
  handleCallback(encryptedData: string): CallbackResult
  
  // 查詢交易狀態
  queryTransaction(orderId: string): TransactionStatus
}
```

### 第三階段：前後端整合（優先級：中）

#### 3.1 後端 API 端點

**訂單相關**
- `POST /api/orders` - 建立訂單
- `GET /api/orders/:id` - 查詢訂單
- `GET /api/orders` - 訂單列表
- `PATCH /api/orders/:id/cancel` - 取消訂單

**金流相關**
- `POST /api/payment/create` - 建立付款
- `POST /api/payment/notify` - 金流通知回調
- `GET /api/payment/return` - 付款完成返回
- `GET /api/payment/status/:orderId` - 查詢付款狀態

#### 3.2 前端整合要點

**結帳流程改造**
1. 收集客戶資料
2. 呼叫建立訂單 API
3. 根據付款方式導向金流
4. 處理付款結果
5. 顯示訂單完成頁面

**狀態管理**
```typescript
// 訂單 Context
interface OrderContextValue {
  currentOrder: Order | null
  createOrder: (data: CreateOrderDto) => Promise<Order>
  getOrder: (id: string) => Promise<Order>
  cancelOrder: (id: string) => Promise<void>
}
```

### 第四階段：完善與測試（優先級：中-低）

#### 4.1 錯誤處理機制

**重試策略**
- 網路錯誤自動重試（最多 3 次）
- 付款失敗提供重新付款選項
- 超時處理（30 秒）

**異常情況處理**
- 重複付款防護
- 金額不符檢查
- 訂單狀態衝突處理

#### 4.2 安全性考量

1. **資料加密**
   - 敏感資料加密儲存
   - HTTPS 傳輸
   - 請求簽章驗證

2. **防護機制**
   - CSRF Token
   - Rate Limiting
   - IP 白名單（Webhook）

3. **日誌記錄**
   - 完整交易日誌
   - 錯誤追蹤
   - 審計軌跡

#### 4.3 測試計劃

**單元測試**
- 加密/解密功能
- 訂單狀態轉換
- 金額計算邏輯

**整合測試**
- 完整付款流程
- 回調處理
- 錯誤情境

**沙盒環境測試**
- 使用藍新測試商店
- 測試各種付款情境
- 壓力測試

## 開發時程估算

| 階段 | 工作項目 | 預估時間 |
|------|---------|---------|
| 第一階段 | 訂單系統基礎 | 3-4 天 |
| 第二階段 | 金流模組開發 | 5-7 天 |
| 第三階段 | 前後端整合 | 3-4 天 |
| 第四階段 | 測試與優化 | 2-3 天 |
| **總計** |  | **13-18 天** |

## 注意事項

1. **法規遵循**
   - 遵守個資法規定
   - 提供退款機制
   - 清楚的服務條款

2. **使用者體驗**
   - 清晰的付款流程
   - 即時的狀態更新
   - 友善的錯誤訊息

3. **維運考量**
   - 監控付款成功率
   - 定期對帳機制
   - 客服工具整合

## 參考資源

- [藍新金流技術文件](https://www.newebpay.com/website/Page/content/download_api)
- [藍新金流測試環境](https://cwww.newebpay.com/)
- [LINE Pay 開發者文件](https://pay.line.me/tw/developers/documentation/download/tech?locale=zh_TW)

## 後續優化建議

1. 支援更多付款方式（Apple Pay、Google Pay）
2. 實作分期付款功能
3. 加入發票串接
4. 建立對帳報表系統
5. 優化付款轉換率追蹤