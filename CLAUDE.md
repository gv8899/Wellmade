# CLAUDE.md

這個檔案為在此程式碼庫中工作的 Claude Code (claude.ai/code) 提供指導。

## 專案概述

Wellmade 是一個內容導向的電商平台，採用 Instagram 風格的商品展示。使用 Next.js 前端和 NestJS 後端構建，具備完整的電商功能包含商品管理、品牌管理、分類系統、購物車、訂單處理、藍新金流支付整合、Google OAuth 認證、智能物流系統和文章管理系統。專案已配置支援本機開發和 Zeabur 雲端部署。

## 部署環境

- **生產環境域名**: 
  - 前端: https://wellmade.select
  - 後端 API: https://api.wellmade.select
- **部署平台**: Zeabur
- **資料庫**: PostgreSQL (Zeabur 托管)

## 核心指令

### 一次啟動前後端
```bash
npm run start:dev         # 一次啟動前後端開發伺服器
npm run dev              # 同上，簡化指令
```

### 後端開發
```bash
cd backend
npm run start:dev           # 啟動開發伺服器 (port 3003)
npm run start:prod          # 生產環境啟動 (需要 NODE_OPTIONS=--experimental-global-webcrypto)
npm run build              # 建置生產版本
npm run migration:run       # 執行資料庫遷移
npm run migration:generate  # 生成新的遷移檔案 (使用 --name=YourName)
npm run migration:revert    # 回退上一個遷移
npm run seed:run           # 使用範例資料填充資料庫
npm run test               # 執行單元測試
npm run test:e2e          # 執行端對端測試
npm run lint              # ESLint 檢查和修復
```

### 前端開發
```bash
cd frontend
npm run dev               # 啟動開發伺服器 (port 3000, 使用 Turbopack)
npm run build            # 生產環境建置
npm run start            # 啟動生產環境伺服器
npm run lint             # ESLint 檢查
npm run format           # Prettier 格式化
```

## 架構

### 後端 (NestJS + PostgreSQL)
- **模組結構**: Auth, Products, Brands, Categories, Carts, Users, Orders, Payment, Admin, Articles, ProductLogistics
- **資料庫**: PostgreSQL 搭配 TypeORM 遷移
- **認證**: JWT + Passport 搭配 Google OAuth
- **關鍵模式**: 
  - 使用 `@Public()` 裝飾器標記公開端點
  - 基於角色的守衛用於管理員功能
  - JSONB 欄位用於豐富的商品內容 (keyFeatures, featureDetails, faqs)
- **支付整合**: 藍新金流 (Newebpay)
- **檔案上傳**: 透過 UploadsController 處理，支援圖片縮圖生成
- **物流系統**: 智能配送限制檢查與多配送方式管理
- **內容管理**: 文章系統支援部落格功能與 SEO 優化

### 前端 (Next.js App Router)
- **狀態管理**: React Context + TanStack Query
- **認證**: NextAuth.js 搭配 Google 提供者
- **關鍵模式**:
  - Context 層級結構: AuthProvider > UserProvider > CartProvider > OrderProvider
  - API 服務層，具備模擬資料回退機制
  - 購物車樂觀更新搭配伺服器同步
  - 完整的結帳流程整合支付系統
- **圖片處理**: 使用 Next.js Image 組件，支援遠端圖片最佳化

### 資料庫結構
- **商品 (Products)**: 豐富內容搭配品牌關聯，JSONB 欄位用於功能/常見問題，支援多變體管理，整合物流配置
- **分類 (Categories)**: 階層式結構，支援 SEO 優化欄位 (metaTitle, metaDescription)
- **品牌 (Brands)**: 品牌資訊管理，與商品多對一關聯
- **購物車 (Carts)**: 支援訪客和認證用戶，自動合併機制，具備唯一性約束確保單一用戶單一購物車，支援部分商品選擇結帳
- **用戶 (Users)**: 基於角色 (admin, user, editor) 搭配 Google OAuth 同步
- **訂單 (Orders)**: 
  - 訂單主表：狀態流轉 (pending → processing → paid → shipped → delivered)
  - 訂單項目：商品快照保存，確保歷史資料完整性
  - 自動編號生成：ORD-YYYYMMDD-XXXXX
  - 配送資訊記錄：支援多種配送方式
- **支付記錄 (PaymentRecords)**: 
  - 交易狀態追蹤 (pending → paid/failed → refunded)
  - 藍新金流交易資料儲存
  - 支援重試機制
- **物流配置 (DeliveryMethodConfig)**: 
  - 配送方式管理：宅配、超商取貨等
  - 費用計算與限制設定
  - 商品級別配送限制
- **文章系統 (Articles, Authors, ArticleCategories)**:
  - 文章內容管理，支援 Markdown 編輯
  - 作者資訊與統計
  - 分類體系與 SEO 優化
  - 發布狀態管理與瀏覽統計

## 開發流程

1. **資料庫設定**: 執行遷移後填充資料
2. **雙伺服器**: 後端 (port 3003) 和前端 (port 3000)
3. **型別安全**: 前後端共享介面
4. **購物車系統**: 樂觀更新搭配本地儲存回退
5. **環境切換**: 本機開發與部署環境透過環境變數無縫切換
6. **開發測試規範**: 每次開發完成後務必進行測試驗證功能正常運作
7. **語言規範**: 透過 Claude Code 開發時，agent 一律使用繁體中文回答

## 環境變數

### 後端 (.env)
```
# 資料庫設定
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME

# JWT 設定
JWT_SECRET, JWT_EXPIRES_IN

# Google OAuth
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
GOOGLE_CALLBACK_URL  # 本機: http://localhost:3000/api/auth/callback/google
                     # 生產: https://wellmade.select/api/auth/callback/google

# 環境設定
BASE_URL             # 本機: http://localhost:3003
                     # 生產: https://api.wellmade.select
FRONTEND_URL         # 本機: http://localhost:3000
                     # 生產: https://wellmade.select

# 支付設定
NEWEBPAY_MERCHANT_ID, NEWEBPAY_HASH_KEY, NEWEBPAY_HASH_IV
NEWEBPAY_RETURN_URL, NEWEBPAY_NOTIFY_URL, NEWEBPAY_CLIENT_BACK_URL
```

### 前端 (.env.local)
```
# API 設定
NEXT_PUBLIC_API_URL  # 本機: http://localhost:3003
                     # 生產: https://api.wellmade.select
BACKEND_URL          # 用於 next.config.js (同上)

# NextAuth 設定
NEXTAUTH_URL         # 本機: http://localhost:3000
                     # 生產: https://wellmade.select
NEXTAUTH_SECRET

# Google OAuth
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```

## 物流系統

### 藍新金流統一物流管理
專案採用藍新金流統一物流方案，整合金流與物流服務，支援完整的超商取貨與宅配功能：

#### 配送方式支援
- **宅配到府**: 標準配送服務，支援指定時段
- **7-ELEVEN**: 24小時營業，超商代收，藍新門市地圖選擇
- **全家便利商店**: 便利取貨，門市眾多，藍新門市地圖選擇  
- **萊爾富**: 藍新金流支援，門市選擇整合
- **OK便利商店**: 藍新金流支援，門市選擇整合

#### 藍新物流整合特色
- **統一平台**: 金流與物流在同一藍新平台，簡化整合複雜度
- **官方門市選擇**: 使用藍新 storeMap API，直接整合四大超商選擇介面
- **安全加密**: AES-256-CBC 加密與 SHA256 簽章，符合藍新規範
- **測試模式**: 開發環境自動回退測試模式，無需正式認證即可開發
- **錯誤處理**: 完整的錯誤處理與回退機制

#### 物流限制檢查
- **商品尺寸限制**: 根據配送方式檢查商品尺寸
- **重量限制**: 超商取貨重量上限檢查
- **特殊商品限制**: 易碎品、高價值商品等特殊處理
- **即時可用性**: 動態檢查配送方式可用性

#### 藍新物流認證設定
```bash
# 後端 .env 設定
NEWEBPAY_LOGISTICS_UID=your_logistics_uid       # 藍新物流商店代號
NEWEBPAY_LOGISTICS_KEY=your_logistics_key       # 加密金鑰  
NEWEBPAY_LOGISTICS_IV=your_logistics_iv         # 加密向量 (16位)
NEWEBPAY_LOGISTICS_API_URL=https://clogistics.newebpay.com/api
NEWEBPAY_LOGISTICS_VERSION=1.0
```

**注意**: 需要向藍新金流申請正式的物流認證資訊，設定完成後即可使用真實門市選擇功能。

#### 關鍵組件
- **ProductLogisticsConfig**: 商品物流配置組件 (`frontend/src/components/admin/ProductLogisticsConfig.tsx`)
- **EnhancedDeliverySelector**: 優化的配送選擇器 (`frontend/src/components/checkout/EnhancedDeliverySelector.tsx`)
- **NewebpayStoreSelector**: 藍新門市選擇組件 (`frontend/src/components/checkout/NewebpayStoreSelector.tsx`)
- **DeliveryRestrictionExplainer**: 配送限制說明組件
- **LogisticsService**: 物流服務層 (`frontend/src/services/logistics.ts`)
- **NewebpayLogisticsService**: 藍新物流服務 (`backend/src/logistics/newebpay-logistics.service.ts`)

#### API 端點
```
# 物流限制檢查
GET  /api/products/[id]/logistics        # 取得商品物流設定
POST /api/cart/logistics/check-availability # 檢查購物車配送可用性
GET  /api/cart/logistics/get-available-methods # 取得可用配送方式
GET  /api/products/system/delivery-methods # 系統配送方式設定

# 藍新物流服務
POST /api/logistics/newebpay/store-map  # 藍新門市地圖選取
GET  /api/logistics/store-map           # 傳統門市地圖選取（相容性）
POST /api/logistics/webhook/store-selected # 門市選取回調
POST /api/logistics/shipment            # 建立物流配送單
GET  /api/logistics/shipment/:orderNo   # 查詢物流配送單
POST /api/logistics/shipment/query      # 查詢物流配送單（遠端 API）
```

### 使用範例
```tsx
import { logisticsService } from '@/services/logistics';

// 檢查商品配送限制
const restrictions = await logisticsService.checkProductLogistics(productId);

// 檢查購物車配送可用性
const availability = await logisticsService.checkCartDeliveryAvailability(cartItems);
```

## 文章管理系統

### 部落格功能架構
專案包含完整的內容管理系統，支援文章發布、作者管理和 SEO 優化：

#### 核心功能
- **文章管理**: 支援 Markdown 編輯，豐富的內容格式
- **作者系統**: 作者資訊管理與文章統計
- **分類體系**: 階層式分類，支援 SEO 設定
- **發布控制**: 草稿、發布狀態管理
- **瀏覽統計**: 文章瀏覽次數追蹤
- **相關文章**: 智能推薦相關內容

#### 關鍵組件
- **RichTextEditor**: 富文本編輯器 (`frontend/src/components/editor/RichTextEditor.tsx`)
- **MediumStyleEditor**: Medium 風格編輯器
- **AuthorForm**: 作者管理表單 (`frontend/src/components/admin/blog/AuthorForm.tsx`)
- **CategoryForm**: 分類管理表單
- **AuthorStatistics**: 作者統計組件

#### 管理介面
- **文章管理**: `/admin/blog/articles` - 文章列表與編輯
- **作者管理**: `/admin/blog/authors` - 作者資訊管理
- **分類管理**: `/admin/blog/categories` - 分類體系設定
- **SEO 設定**: `/admin/blog/seo` - SEO 優化設定

#### API 端點
```
GET  /api/articles                    # 取得文章列表
POST /api/articles                    # 創建新文章
GET  /api/articles/[id]              # 取得單一文章
PUT  /api/articles/[id]              # 更新文章
DELETE /api/articles/[id]            # 刪除文章
POST /api/articles/[id]/view         # 記錄瀏覽次數
GET  /api/articles/[id]/related      # 取得相關文章
GET  /api/articles/featured          # 取得精選文章

GET  /api/authors                    # 取得作者列表
POST /api/authors                    # 創建新作者
GET  /api/authors/[id]/statistics    # 取得作者統計

GET  /api/article-categories         # 取得分類列表
POST /api/article-categories         # 創建新分類
PUT  /api/article-categories/[id]/toggle-status # 切換分類狀態
```

#### 前端路由
- **公開頁面**: 
  - `/blog` - 部落格首頁
  - `/blog/[slug]` - 文章詳細頁面
- **管理頁面**: 
  - `/admin/blog` - 部落格管理總覽
  - `/admin/blog/articles/new` - 新增文章
  - `/admin/blog/articles/[id]/edit` - 編輯文章

## 價格顯示系統

專案包含統一的價格格式化工具：
- **位置**: `frontend/src/utils/format.ts`
- **主要函式**:
  - `formatPrice()` - 基礎數字格式化，支援千分位逗號
  - `formatTWD()` - 台幣格式化 (NT$ X,XXX)
  - `formatPriceRange()` - 價格範圍顯示 (NT$ X,XXX - X,XXX)
  - `formatSubtotal()` - 小計計算與格式化
  - `formatNumber()` - 純數字格式化（不含貨幣符號）
- **使用規範**: 所有價格顯示必須使用統一格式化函式，確保一致性

### 使用範例
```tsx
import { formatTWD, formatPriceRange, formatSubtotal } from '@/utils/format';

// 單一價格顯示
<Text>{formatTWD(1234)}</Text>  // "NT$ 1,234"

// 價格範圍顯示
<Text>{formatPriceRange(100, 500)}</Text>  // "NT$ 100 - 500"

// 小計計算
<Text>{formatSubtotal(99, 3)}</Text>  // "NT$ 297"
```

## 設計系統最佳實踐

### 文字系統架構
- **統一變體使用**: 所有 Text 組件必須使用設計系統定義的變體
- **避免 CSS 覆蓋**: 絕不使用 Tailwind 的 `prose` 或其他覆蓋字體樣式的類別
- **字級階層**: 
  - `title1` (最大，取代已移除的 largeTitle)
  - `title2`, `title3` (頁面主要標題)
  - `headline` (區塊標題)
  - `body` (主要內容)
  - `callout` (強調內容)
  - `subhead`, `footnote` (輔助資訊)
  - `caption1`, `caption2` (最小字級)

### 重要規則與禁忌

#### ✅ 正確做法
```tsx
// 標題和內容分開使用獨立的 Text 組件
<Text variant="headline" color={colors.neutral.label}>標題</Text>
<Text variant="body" color={colors.neutral.secondaryLabel}>內容文字</Text>

// 卡片使用設計系統的 Card 組件
<Card variant="elevated" padding="large" colorMode="light">
  <Text variant="headline">標題</Text>
  <Text variant="body">內容</Text>
</Card>

// 無背景卡片使用 borderless 變體
<Card variant="borderless" padding="large" colorMode="light">
```

#### ❌ 錯誤做法
```tsx
// 錯誤：在 Text 組件內使用 span 會破壞字體系統
<Text variant="headline">
  標題<br />
  <span style={{ fontWeight: 'normal' }}>內容</span>  // ❌ 會繼承 headline 字體大小
</Text>

// 錯誤：使用 prose 類別會覆蓋設計系統
<div className="prose prose-lg">  // ❌ 會覆蓋 Text 組件樣式

// 錯誤：使用邊框卡片
<div className="border border-gray-200">  // ❌ 應使用陰影
```

### 卡片設計規範
- **預設樣式**: 使用陰影卡片，避免邊框
- **統一陰影**: `boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)'`
- **保留邊框場景**: 僅在表單輸入框、按鈕狀態、分隔線等功能性元素使用
- **卡片變體選擇**:
  - `elevated`: 帶陰影的卡片（預設）
  - `default`: 純色背景無陰影
  - `outlined`: 邊框卡片（特殊情況）
  - `borderless`: 無邊框無陰影，完全透明背景

### 常見錯誤與修正
1. **文字大小不一致**: 確保相同變體的 Text 組件不被其他樣式覆蓋
2. **字體繼承問題**: 避免在 Text 組件內嵌套 HTML 標籤改變樣式
3. **暗色模式衝突**: 移除 `@media (prefers-color-scheme: dark)` 自動切換

## 關鍵實作細節

- **商品管理**: 
  - 豐富媒體輪播搭配 JSONB 儲存的功能詳情
  - 支援多變體管理（尺寸、顏色等）
  - SKU 自動生成系統
  - 整合物流配置，支援商品級別配送限制
- **購物車系統**: 
  - 混合訪客/認證系統搭配樂觀更新
  - 自動合併機制，登入時合併訪客購物車
  - 本地儲存備份，離線支援
  - 強制綁定機制 (`/api/cart/force-bind`) 修復購物車同步問題
  - 資料完整性約束，確保單一用戶單一購物車
  - 自動修復機制，登入後檢測並修復購物車狀態
  - **部分商品結帳**: 支援 selectedItems 概念，允許選擇性結帳
- **結帳系統優化**:
  - **EnhancedCheckoutForm**: 完全重構的結帳表單組件
  - **表單驗證**: 即時電子郵件與手機號碼格式驗證
  - **配送選擇器**: 簡化設計，移除不必要視覺元素
  - **費用計算**: ShippingCalculator 組件，支援選中商品計算
  - **間距優化**: 統一表單區塊間距與視覺層次
- **物流系統**:
  - **智能限制檢查**: 根據商品屬性動態檢查配送可用性
  - **多配送方式**: 宅配、7-ELEVEN、全家便利商店
  - **即時驗證**: 購物車配送方式可用性即時檢查
  - **配送費計算**: 根據配送方式自動計算費用
- **文章管理系統**:
  - **內容管理**: 支援 Markdown 編輯與富文本格式
  - **作者管理**: 完整的作者資訊與統計系統
  - **SEO 優化**: 分類與文章 SEO 設定支援
  - **發布控制**: 草稿、發布狀態管理
  - **統計追蹤**: 文章瀏覽次數與作者統計
- **訂單處理**: 
  - 完整狀態機管理訂單生命週期
  - 商品資訊快照，保證歷史資料一致性
  - 自動編號生成，格式化訂單追蹤
  - **配送資訊記錄**: 完整的配送方式與門市資訊保存
- **支付整合**: 
  - 藍新金流 API 整合（信用卡、LINE Pay）
  - AES 加密與 SHA256 簽章驗證
  - 支付狀態即時更新與錯誤處理
  - 支援支付重試機制
- **認證系統**: 
  - 雙重架構：NextAuth.js 前端 + NestJS JWT 後端
  - Google OAuth 無縫整合
  - 角色基礎權限控制
- **API 架構**: 
  - 後端不可用時回退到模擬資料
  - 統一錯誤處理與日誌記錄
  - API 代理層處理 CORS 和認證轉發
- **資料庫管理**: 
  - 遷移優先方式，所有結構變更透過 TypeORM 遷移
  - 種子資料支援快速環境設定
  - **遷移安全檢查**: 防止 PostgreSQL 欄位名稱大小寫問題
- **檔案處理**: 
  - 圖片上傳自動生成縮圖 (original, medium, thumbnail)
  - 支援批次上傳和進度追蹤
- **跨域支援**: 
  - 動態 CORS 配置，支援多域名
  - 包含 Zeabur 子域名自動識別
- **設計系統最佳實踐**:
  - **CSS 衝突預防**: 避免簡寫屬性與具體屬性混用
  - **表單間距管理**: 統一的間距處理方式
  - **組件一致性**: 確保設計系統組件正確使用

## 部署注意事項

1. **環境變數管理**: 
   - 確保所有生產環境變數正確設定
   - BASE_URL 必須設定，否則圖片 URL 會錯誤生成為 localhost

2. **資料庫同步**: 
   - 生產環境應設定 `synchronize: false`
   - 使用遷移管理資料庫結構變更

3. **Node.js 版本**: 
   - 需要 Node.js >= 18.0.0
   - 後端需要 `NODE_OPTIONS=--experimental-global-webcrypto`

4. **域名配置**:
   - 確保 DNS 正確指向
   - Google OAuth 回調 URL 需在 Google Cloud Console 更新

5. **圖片處理**:
   - 前端直接使用後端 URL，不經過代理
   - next.config.js 已配置允許的圖片域名

## 啟動專案相關
- 前端的 port 一律用 3000，如果被佔用且不是 3000 就殺掉，確保每次有啟動或是重啟專案時前端都在 port 3000
- 後端的 port 一律用 3003，如果被佔用且不是 3003 就殺掉，確保每次有啟動或是重啟專案時後端都在 port 3003
- 如果是前後端的專案要透過 Bash 啟動或是重啟，不需要詢問授權，直接進行就好

## 開發與部署最佳實踐

1. **本機測試優先**: 
   - 在推送前確保本機完整測試
   - 使用相同的環境變數結構，只改變值
   - 執行完整的支付流程測試（使用測試卡號）

2. **漸進式部署**:
   - 先部署後端，確認 API 正常
   - 再部署前端，確認整體功能
   - 最後測試支付回調是否正常運作

3. **監控與日誌**:
   - 利用 Zeabur 的日誌功能追蹤問題
   - 後端已配置詳細的錯誤日誌
   - 支付相關操作需特別注意日誌監控

4. **版本控制**:
   - 使用語意化版本號
   - 重要變更記錄在 git commit 中
   - 資料庫遷移檔案需妥善管理版本

5. **安全性考量**:
   - 支付金鑰絕不可提交到版本控制
   - 定期更換 JWT 和支付相關密鑰
   - 敏感資料加密存儲

## API 路由結構

### 後端 API 端點
- `/api/auth/*` - 認證相關（登入、註冊、Google OAuth）
- `/api/products/*` - 商品管理（CRUD、搜尋、篩選）
- `/api/products/[id]/logistics` - 商品物流設定
- `/api/products/system/delivery-methods` - 系統配送方式
- `/api/brands/*` - 品牌管理
- `/api/categories/*` - 分類管理
- `/api/carts/*` - 購物車操作
- `/api/carts/logistics/*` - 購物車物流檢查
- `/api/orders/*` - 訂單管理
- `/api/payment/*` - 支付處理（創建、回調、查詢）
- `/api/admin/*` - 管理員功能
- `/api/uploads/*` - 檔案上傳
- `/api/articles/*` - 文章管理（CRUD、發布、統計）
- `/api/authors/*` - 作者管理與統計
- `/api/article-categories/*` - 文章分類管理

### 前端 API 代理
- `/api/auth/callback/google` - Google OAuth 回調
- `/api/brands/*` - 品牌資料代理
- `/api/categories/*` - 分類資料代理
- `/api/products/*` - 商品資料代理
- `/api/products/[id]/logistics` - 商品物流設定代理
- `/api/cart/*` - 購物車操作代理
- `/api/cart/force-bind` - 購物車強制綁定修復機制
- `/api/cart/logistics/*` - 物流檢查代理
- `/api/orders/*` - 訂單操作代理
- `/api/articles/*` - 文章系統代理
- `/api/authors/*` - 作者管理代理
- `/api/article-categories/*` - 文章分類代理
- `/api/test-session` - 測試會話端點

## 測試和除錯

### 手動測試工具
- **認證測試頁面**: `/test-auth` - 完整的 OAuth 流程測試
- **購物車狀態測試**: `/test-cart-state` - 購物車狀態管理測試
- **測試指南**: `backend/manual-auth-test.md` - 詳細的手動測試步驟
- **測試腳本**: 多個除錯腳本用於測試購物車、認證、API 整合等功能
  - `test-cart-flow.js` - 購物車流程測試
  - `test-authenticated-cart.js` - 認證用戶購物車測試
  - `test-complete-flow.js` - 完整流程測試
  - `test-frontend-integration.js` - 前端整合測試
  - `test-logistics-integration.js` - 物流系統整合測試
  - `test-author-management.js` - 作者管理功能測試
  - `test-author-statistics.js` - 作者統計功能測試

### 測試流程
1. **認證測試**: 訪問 `/test-auth` 頁面驗證 Google OAuth 流程
2. **購物車測試**: 使用測試腳本驗證購物車綁定和同步
3. **API 測試**: 檢查各 API 端點的回應和錯誤處理
4. **自動修復驗證**: 確認購物車自動修復機制正常運作
5. **物流測試**: 驗證配送限制檢查與可用性計算
6. **文章系統測試**: 測試文章發布、編輯和統計功能
7. **結帳流程測試**: 驗證優化後的結帳表單與配送選擇

### 自動化測試
- **Playwright 測試**: `frontend/tests/` - 端對端自動化測試
  - `checkout-functionality.spec.ts` - 結帳功能測試
  - `mobile-swipe.spec.ts` - 手機滑動功能測試
  - `simple-swipe.spec.ts` - 簡化滑動測試
- **測試報告**: `frontend/playwright-report/` - 測試結果報告
- **測試設定**: `frontend/playwright.config.ts` - Playwright 配置檔案

## 故障排除

### Zeabur 部署常見問題

#### 資料庫遷移失敗
**症狀**: 
```
Migration "AddUniqueConstraintToCart1753621030890" failed
error: column "userid" does not exist
```

**解決方案**:
1. **PostgreSQL 欄位名稱大小寫問題**:
   - 確保 SQL 語句中的欄位名稱使用雙引號
   - 正確: `WHERE "userId" IS NOT NULL`
   - 錯誤: `WHERE userId IS NOT NULL`

2. **刪除問題遷移檔案**:
   ```bash
   # 如果遷移持續失敗，可以移除問題檔案
   rm backend/migrations/problem-migration.ts
   git add -A && git commit -m "移除有問題的遷移檔案"
   git push origin old-version
   ```

#### 環境變數設定問題
**症狀**:
```
[EnvironmentValidator] Missing required environment variables: 
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
```

**解決方案**:
1. **確認 PostgreSQL 服務變數**:
   - 進入 Zeabur PostgreSQL 服務查看 Connect 頁籤
   - 複製正確的連接參數

2. **後端服務環境變數設定**:
   ```
   DB_HOST=${POSTGRES_HOST}
   DB_PORT=${POSTGRES_PORT}  
   DB_USER=root
   DB_PASSWORD=實際密碼值（不要用變數引用）
   DB_NAME=zeabur
   ```

3. **常見設定錯誤**:
   - ❌ `DB_PASSWORD=${PASSWORD}` - 跨服務變數引用可能失敗
   - ✅ `DB_PASSWORD=OR8Nd9LYCiP3WqujI2a0r1e7Sw5nvK64` - 直接使用實際值

#### 建置快取問題
**症狀**: Zeabur 拉取到最新代碼但仍使用舊版本建置

**解決方案**:
1. **清除建置快取**:
   - 進入服務 Settings → Advanced → Clear Build Cache
   - 點擊 Redeploy 重新部署

2. **確認代碼同步**:
   ```bash
   # 檢查本地和遠端 commit 一致
   git ls-remote origin old-version
   git log --oneline -5
   ```

#### 支付配置錯誤
**症狀**:
```
Missing required Newebpay configuration: merchantId
```

**解決方案**:
- 確保所有藍新金流環境變數都已設定：
  ```
  NEWEBPAY_MERCHANT_ID=MS1791066736
  NEWEBPAY_HASH_KEY=實際金鑰
  NEWEBPAY_HASH_IV=實際向量
  NEWEBPAY_RETURN_URL=https://api.wellmade.select/payment/return
  NEWEBPAY_NOTIFY_URL=https://api.wellmade.select/payment/notify
  ```

### 本機開發常見問題

#### 常見 500 錯誤和後端連接問題

**症狀**:
- 前端顯示 "AxiosError: Request failed with status code 500"
- Categories、Products 或其他 API 端點無法訪問
- 後端似乎啟動但無法連接

**解決步驟**:

1. **檢查後端服務狀態**:
   ```bash
   # 檢查 3003 端口是否被佔用
   lsof -i :3003
   netstat -an | grep 3003
   
   # 測試後端健康狀態
   curl http://localhost:3003/health
   ```

2. **重啟後端服務**:
   ```bash
   # 殺掉所有相關進程
   pkill -f "nest start"
   pkill -f "npm.*start:dev"
   lsof -ti:3003 | xargs kill -9
   
   # 清理並重啟
   cd backend
   npm run start:dev
   ```

3. **檢查資料庫連接**:
   ```bash
   # 確認 PostgreSQL 服務運行
   brew services list | grep postgresql
   
   # 測試資料庫連接
   psql -h 127.0.0.1 -p 5432 -U wellmade_user -d wellmade -c "SELECT 1;"
   ```

4. **驗證環境變數**:
   ```bash
   # 確認後端環境變數
   cd backend
   grep -E "(DB_|BASE_URL|FRONTEND_URL)" .env
   
   # 確認前端環境變數
   cd frontend
   grep -E "(NEXT_PUBLIC_API_URL|BACKEND_URL)" .env.local
   ```

5. **端口衝突問題**:
   ```bash
   # 確保前端在正確端口
   lsof -ti:3000 | xargs kill -9
   cd frontend && npm run dev
   
   # 確保後端在正確端口  
   lsof -ti:3003 | xargs kill -9
   cd backend && npm run start:dev
   ```

#### 預防措施
- 定期重啟開發服務以避免記憶體泄漏
- 確保資料庫連接池配置適當
- 監控日誌檔案以提前發現問題
- 使用健康檢查端點定期驗證服務狀態

### 設計系統相關問題

#### CSS 邊框屬性衝突
**症狀**: 輸入欄位在輸入時出現閃爍現象

**原因**: 混合使用 CSS 簡寫屬性 `border` 和具體屬性 `borderColor`

**解決方案**:
```typescript
// ❌ 錯誤：會導致衝突
const style = {
  border: '1px solid #E5E5E7',
  borderColor: props.error ? '#FF3B30' : '#E5E5E7'
};

// ✅ 正確：使用具體屬性
const style = {
  borderWidth: '1px',
  borderStyle: 'solid', 
  borderColor: props.error ? '#FF3B30' : '#E5E5E7'
};
```

#### FormField 間距問題
**解決方案**: 在需要額外間距的地方使用容器包裹
```tsx
// 為第一個表單欄位添加上方間距
<div style={{ marginTop: '1rem' }}>
  <FormField label="收件人姓名" ... />
</div>
```

#### Banner 管理系統相關

**Banner 上傳和驗證問題**:
- Banner 創建時的 URL 驗證已放寬，移除了嚴格的 @IsUrl 檢查
- 圖片上傳使用 Sharp 庫處理，支援多種格式
- CreateBannerDto 驗證已優化以支援各種圖片 URL 格式

**Banner API 端點**:
- `GET /banners/admin` - 管理員獲取所有 Banner
- `POST /banners` - 創建新 Banner  
- `PATCH /banners/:id` - 更新 Banner
- `DELETE /banners/:id` - 刪除 Banner
- `PATCH /banners/:id/toggle` - 切換 Banner 啟用狀態