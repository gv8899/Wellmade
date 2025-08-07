# 產品物流支援 API 文檔

## 概述

Wellmade 平台已完整實作產品物流支援功能，包括配送方式管理、產品物流配置、購物車配送可用性檢查等功能。

## 資料庫結構

### 產品表 (products)
- 添加了 `logisticsConfig` JSONB 欄位，儲存產品的物流配置
- 預設支援所有配送方式：宅配到府、7-ELEVEN、全家、萊爾富、OK便利商店

### 產品變體表 (product_variants)
- 同樣添加了 `logisticsConfig` JSONB 欄位
- 變體可以覆蓋產品的物流設定

### 配送方式配置表 (delivery_method_configs)
- 儲存系統層級的配送方式設定
- 包含運費、配送天數、重量限制、尺寸限制等資訊

## API 端點

### 1. 系統配送方式查詢

**GET** `/products/system/delivery-methods`

取得所有可用的配送方式及其詳細設定。

**回應範例:**
```json
[
  {
    "id": "uuid",
    "method": "home_delivery",
    "name": "宅配到府",
    "description": "專人配送到指定地址，安全便利",
    "baseFee": "100.00",
    "estimatedDays": 3,
    "isActive": true,
    "globalLimits": {
      "maxWeight": 30,
      "allowFragile": true,
      "maxDimensions": {
        "length": 100,
        "width": 100,
        "height": 100
      },
      "allowHighValue": true,
      "allowRefrigerated": true
    }
  }
]
```

### 2. 產品物流配置查詢

**GET** `/products/{productId}/logistics`

取得特定產品的物流配置。

**回應範例:**
```json
{
  "productId": "uuid",
  "logisticsConfig": {
    "supportedDeliveryMethods": [
      "home_delivery",
      "seven_eleven",
      "family_mart",
      "hi_life",
      "ok_mart"
    ],
    "physicalAttributes": {
      "weight": 0.5,
      "dimensions": {
        "length": 20,
        "width": 15,
        "height": 10
      },
      "isFragile": false,
      "isHighValue": false
    }
  }
}
```

### 3. 產品物流配置更新 (管理員)

**PATCH** `/products/{productId}/logistics`

更新產品的物流配置（需要管理員權限）。

**請求範例:**
```json
{
  "supportedDeliveryMethods": ["home_delivery", "seven_eleven"],
  "physicalAttributes": {
    "weight": 2.0,
    "isFragile": true
  },
  "deliveryRestrictions": {
    "seven_eleven": {
      "restricted": true,
      "reason": "商品過於易碎，不適合超商取貨"
    }
  }
}
```

### 4. 購物車配送可用性檢查

**POST** `/api/cart/logistics/check-availability`

檢查購物車中商品的配送方式可用性。

**請求範例:**
```json
{
  "cartItems": [
    {
      "productId": "uuid",
      "variantId": "uuid",
      "quantity": 2
    }
  ]
}
```

**回應範例:**
```json
[
  {
    "method": "home_delivery",
    "available": true,
    "restrictions": []
  },
  {
    "method": "seven_eleven",
    "available": false,
    "restrictions": [
      {
        "productId": "uuid",
        "productName": "易碎商品",
        "restrictionType": "fragile_item",
        "reason": "易碎商品，不適合此配送方式"
      }
    ]
  }
]
```

### 5. 購物車配送方式查詢

**POST** `/api/cart/logistics/get-available-methods`

取得所有可用的配送方式（與端點1相同功能，但位於購物車路由下）。

## 配送方式枚舉

```typescript
enum DeliveryMethod {
  HOME_DELIVERY = 'home_delivery',     // 宅配到府
  SEVEN_ELEVEN = 'seven_eleven',       // 7-11取貨
  FAMILY_MART = 'family_mart',         // 全家取貨
  HI_LIFE = 'hi_life',                 // 萊爾富取貨
  OK_MART = 'ok_mart'                  // OK便利商店取貨
}
```

## 限制類型枚舉

```typescript
enum DeliveryRestrictionType {
  SIZE_LIMIT = 'size_limit',           // 尺寸限制
  WEIGHT_LIMIT = 'weight_limit',       // 重量限制
  FRAGILE_ITEM = 'fragile_item',       // 易碎品限制
  HIGH_VALUE = 'high_value',           // 高價值商品限制
  REFRIGERATED = 'refrigerated',       // 冷藏商品限制
  DANGEROUS_GOODS = 'dangerous_goods', // 危險品限制
  STORE_CAPACITY = 'store_capacity',   // 門市容量限制
  CUSTOM = 'custom'                    // 自訂限制
}
```

## 系統預設配送限制

### 宅配到府
- 最大重量：30kg
- 最大尺寸：100x100x100cm
- 支援易碎品、高價值商品、冷藏商品
- 基本運費：NT$ 100
- 預估配送：3天

### 超商取貨 (7-11, 全家, 萊爾富, OK)
- 最大重量：5kg
- 最大尺寸：45x30x30cm
- 不支援易碎品、高價值商品、冷藏商品
- 基本運費：NT$ 55-65
- 預估配送：2天

## 前端整合建議

1. **產品頁面**: 顯示支援的配送方式和預估運費
2. **購物車頁面**: 檢查配送可用性，提示不可配送的商品
3. **結帳頁面**: 根據購物車內容篩選可用的配送方式
4. **管理後台**: 提供產品物流配置的編輯介面

## 測試指令

```bash
# 測試配送方式查詢
curl -X GET "http://localhost:3003/products/system/delivery-methods"

# 測試產品物流配置
curl -X GET "http://localhost:3003/products/{productId}/logistics"

# 測試購物車配送檢查
curl -X POST "http://localhost:3003/api/cart/logistics/check-availability" \
  -H "Content-Type: application/json" \
  -d '{"cartItems": [{"productId": "uuid", "quantity": 1}]}'
```

## 注意事項

1. 所有 GET 端點都是公開的，不需要認證
2. 產品物流配置更新需要管理員權限
3. 購物車相關端點支援訪客使用
4. 物流配置採用 JSONB 格式儲存，支援靈活的擴展
5. 產品變體的物流配置會覆蓋產品層級的設定