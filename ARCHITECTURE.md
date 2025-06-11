# Wellmade 專案資料結構概覽

## 專案總體架構

Wellmade 是一個全棧電商應用，採用前後端分離架構：
- **後端**：使用 NestJS 框架 (TypeScript)，提供 RESTful API
- **前端**：使用 Next.js 框架 (React + TypeScript)，實現動態網頁應用

## 後端架構 (NestJS)

### 主要模組

```
backend/
├── src/
│   ├── auth/               # 身份驗證相關模組
│   │   ├── decorators/     # 自定義裝飾器
│   │   ├── dto/            # 資料傳輸物件
│   │   ├── guards/         # 路由守衛
│   │   └── strategies/     # 驗證策略（JWT等）
│   ├── brands/             # 品牌相關模組
│   │   └── dto/            # 品牌相關DTO
│   ├── products/           # 產品相關模組
│   │   ├── dto/            # 產品相關DTO
│   │   ├── product.entity.ts      # 產品實體定義
│   │   ├── products.controller.ts # 產品控制器
│   │   ├── products.module.ts     # 產品模組定義
│   │   └── products.service.ts    # 產品服務邏輯
│   ├── users/              # 用戶相關模組
│   │   └── dto/            # 用戶相關DTO
│   ├── migrations/         # 資料庫遷移檔案
│   └── seeds/              # 資料庫種子資料
```

### 核心資料模型

#### 產品模型 (Product Entity)
```typescript
// product.entity.ts
export class Product {
  id: string;                // 唯一識別碼
  name: string;              // 產品名稱
  description: string;       // 產品描述
  price: number;             // 價格
  stock: number;             // 庫存
  category: string;          // 分類
  imageUrl: string;          // 主圖片URL
  images: string[];          // 附加圖片URL列表
  isActive: boolean;         // 是否上架
  keyFeatures: KeyFeature[]; // 關鍵特性列表
  brandId?: string;          // 品牌ID
  brand?: Brand;             // 關聯品牌
  createdAt: Date;           // 創建時間
  updatedAt: Date;           // 更新時間
}
```

#### 關鍵特性模型 (KeyFeature)
```typescript
export interface KeyFeature {
  image: string;      // 特性圖片URL
  title: string;      // 特性標題
  subtitle?: string;  // 特性副標題
  description: string; // 特性描述
}
```

### 主要 API 端點

```
# 產品相關
GET    /products                # 獲取產品列表（支援分頁和篩選）
GET    /products/:id            # 獲取單一產品詳情
GET    /products/:id/key-features # 獲取產品關鍵特性
POST   /products                # 創建新產品
PATCH  /products/:id            # 更新產品
DELETE /products/:id            # 刪除產品

# 品牌相關
GET    /brands                  # 獲取品牌列表
GET    /brands/:id              # 獲取品牌詳情
POST   /brands                  # 創建新品牌
PATCH  /brands/:id              # 更新品牌
DELETE /brands/:id              # 刪除品牌

# 用戶相關
GET    /users/me                # 獲取當前用戶信息
POST   /auth/login              # 用戶登入
POST   /auth/register           # 用戶註冊
```

## 前端架構 (Next.js)

```
frontend/
├── src/
│   ├── app/                  # App Router 路由結構
│   │   ├── api/              # API 路由處理
│   │   ├── cart/             # 購物車頁面
│   │   ├── checkout/         # 結帳頁面
│   │   ├── components/       # 頁面級組件
│   │   ├── email-verify/     # 郵箱驗證頁
│   │   ├── login/            # 登入頁
│   │   ├── product/          # 產品相關頁面
│   │   │   └── [id]/         # 產品詳情頁（動態路由）
│   │   │       ├── BrandSection.tsx
│   │   │       ├── Carousel.tsx
│   │   │       ├── FAQSection.tsx
│   │   │       ├── FeatureDetails.tsx
│   │   │       ├── KeyFeatures.tsx          # 關鍵特性組件
│   │   │       ├── ProductDetailClient.tsx  # 產品詳情客戶端組件
│   │   │       ├── ProductHero.tsx
│   │   │       ├── ProductPurchaseOptions.tsx
│   │   │       └── page.tsx                 # 頁面入口
│   ├── components/           # 共享組件
│   ├── hooks/                # 自定義 React Hooks
│   └── services/             # API 服務
│       └── api.ts            # API 請求封裝
```

### 核心前端模型

#### 產品模型 (Product Interface)
```typescript
// services/api.ts
export interface Product {
  id: string;              // 唯一識別碼
  name: string;            // 產品名稱
  description: string;     // 產品描述
  price: number;           // 價格
  stock: number;           // 庫存
  category: string;        // 分類
  imageUrl: string;        // 主圖片URL
  images: string[];        // 附加圖片URL列表
  isActive: boolean;       // 是否上架
  brandId?: string;        // 品牌ID
  brand?: Brand;           // 關聯品牌
  keyFeatures?: KeyFeature[]; // 關鍵特性列表
  createdAt?: string;      // 創建時間
  updatedAt?: string;      // 更新時間
}
```

#### 前端產品展示模型
```typescript
// ProductDetailClient.tsx
interface Product {
  id: string;            // 唯一識別碼
  name: string;          // 產品名稱
  price: number;         // 價格
  description: string;   // 產品描述
  cover: string;         // 封面圖
  category: string;      // 分類
  style?: string;        // 風格/款式
  media: {               // 多媒體內容
    type: "image" | "video";
    src: string;
    alt?: string;
  }[];
  brandId?: string;      // 品牌ID
  brand?: {              // 關聯品牌
    id: string;
    name: string;
    description: string;
    logoUrl: string;
  };
  keyFeatures?: KeyFeatureCard[]; // 關鍵特性卡片
}
```

#### 關鍵特性卡片模型
```typescript
// KeyFeatures.tsx
export interface KeyFeatureCard {
  image: string;         // 圖片路徑
  title: string;         // 標題
  subtitle?: string;     // 副標題
  description: string;   // 描述
}
```

## API 資料流

### 產品詳情頁的資料流
1. 使用者訪問 `/product/[id]`
2. `page.tsx` 渲染 `ProductDetailClient.tsx`
3. `ProductDetailClient.tsx` 使用 `getProductById(id)` 從 API 獲取產品資料
4. 將 API 資料轉換為前端顯示格式，包括將 `keyFeatures` 傳遞給 `KeyFeatures` 組件
5. 渲染產品詳情頁的所有組件，包括產品英雄區、關鍵特性、特性詳情、購買選項等

### 購物車流程
1. 使用者點擊「加入購物車」按鈕
2. 前端將產品資訊添加到本地狀態（localStorage）
3. 購物車頁面從本地狀態獲取產品列表
4. 結帳時通過 API 提交訂單資訊

## 資料庫關係

主要實體間的關係：
- `Product` ↔ `Brand`: 多對一（多個產品可以屬於一個品牌）
- `User` → `Order`: 一對多（一個用戶可以有多個訂單）
- `Order` → `OrderItem` → `Product`: 一對多對一（一個訂單有多個訂單項，每個訂單項對應一個產品）

## 開發注意事項

1. **前端與後端模型同步**：當修改後端產品實體（`Product.entity.ts`）時，記得同步更新前端的相關介面定義（`api.ts` 和 `ProductDetailClient.tsx`）
2. **關鍵特性（KeyFeatures）**：已實現前端顯示與後端 API 整合，使用 JSONB 欄位儲存
3. **圖片資源**：需留意外部圖片链接（如 Google Drive）的權限問題，建議使用專門的圖片託管服務
4. **API 錯誤處理**：前端有備用機制，當 API 請求失敗時會使用模擬資料

此資料結構概覽將有助於快速理解整個專案架構，便於更有效率地開發和維護。
