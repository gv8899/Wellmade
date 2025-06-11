# 開發 TODO 清單

<!--
本文件為專案開發進度與規格追蹤，請依各區塊說明維護內容。
每個區塊前皆有說明用途，便於日後維護與回顧。
-->

## 1. 專案初始化與環境設定
<!--
此區塊記錄專案結構、環境變數、Lint、TypeScript 等基礎設置任務。
-->
- [x] 建立專案結構
- [x] 設定版本控制（Git，已初始化、設置 .gitignore、首次 commit 並推送到 GitHub）
- [x] 設定開發環境變數
- [x] 設定 ESLint 和 Prettier
- [x] 設定 TypeScript 配置

## 2. 前端開發
<!--
前端開發相關任務，包含 UI、認證、商品、購物流程、會員系統等。
每個子區塊細分功能模組，便於追蹤與分工。
-->

### 2.1 基礎設置
- [x] 設置 Next.js 項目
- [x] 設置 Tailwind CSS
- [x] 設置 TypeScript
- [x] 設置 UI 組件庫（Shadcn UI）
- [x] 設置 API 客戶端（TanStack Query + Axios）
- [x] 更新 Next.js 圖片配置，使用 `images.remotePatterns` 取代已棄用的 `images.domains`
- [x] 安裝和配置 Axios 攜帶器和錯誤處理
- [x] 解決跨域請求（CORS）問題

### 2.2 認證系統
- [x] 設置 NextAuth.js
- [x] 實作登入頁面
  - [x] 調整輸入框文字顏色為黑色 (UI優化)
- [ ] 實作註冊頁面
- [x] 實作密碼重設功能
  - [x] 密碼重設請求頁面
  - [ ] 密碼重設頁面
  - [x] 表單驗證
  - [x] API 集成
- [x] 實作 Email 驗證
  - [x] Email 驗證頁面
  - [ ] 驗證狀態管理
  - [x] API 集成
- [ ] 認證系統類型定義
  - [x] NextAuth.js 類型定義
  - [x] Session 類型定義
  - [x] JWT 類型定義
  - [x] User 類型定義
- [ ] 認證系統優化
  - [x] 實作全域使用者狀態管理 (UserContext)
  - [x] 實作登出功能 (整合於漢堡選單)
  - [x] 漢堡選單依認證狀態顯示登入/登出選項 (UI/UX)
  - [ ] 記住我功能
  - [ ] 密碼強度檢查
  - [ ] 二階驗證
  - [ ] 記錄登入日誌
  - [ ] 狀態管理優化 (除了UserContext之外的其他潛在優化)
  - [ ] 錯誤處理改進
  - [ ] 性能優化

### 2.3 商品系統
<!--
商品相關功能，包括商品列表、篩選、詳細頁、加購物車、收藏等。
重點：如遇序列化錯誤、Provider 結構問題，請參考已完成細項。
-->
- [x] 商品列表頁 UI 與資料串接
- [x] 商品詳細頁 UI 與資料串接
- [x] 商品加入購物車功能
- [x] 商品收藏功能
- [x] FeatureDetails、KeyFeatures、FAQSection 圖文區塊樣式優化
- [x] FeatureDetails API 串接
  - [x] 後端新增 FeatureDetail 模型與 DTO
  - [x] 更新產品種子資料，加入 featureDetails 範例
  - [x] 前端 API 服務整合
  - [x] 產品詳情頁面動態載入 featureDetails
  - [x] 更新文件（ARCHITECTURE.md）
- [x] 詳細頁新增「貨到通知」modal（含表單驗證、送出成功畫面、UI/UX優化）
- [x] 詳細頁底部新增「好物推薦」區塊，沿用首頁商品卡片元件
- [x] 其他細節修正（如 placeholder、分隔線、modal 關閉體驗等）

-->
- [x] 商品列表頁（含 mock 資料、多商品卡片）
- [x] 商品卡片樣式優化（Unipapa 風格、極簡黑、全新 banner）
- [x] 商品列表頁頂部 banner（全寬森林圖、無文字）
- [x] 商品詳細頁樣式同步首頁風格
- [x] 商品篩選功能（分類、價格、風格，支援即時多條件過濾，UI 極簡）
- [x] 商品資料串接 API
- [ ] 首頁 banner 圖片可自訂/上傳
- [ ] 首頁/商品頁 RWD 最佳化
- [ ] 其他互動優化與細節調整
-->
- [x] 商品列表頁面（已完成 client 化、修正序列化錯誤、Provider 結構調整）
    - [x] 移除所有 server fetch/async，純 client component
    - [x] Mock API 日期欄位全部為 ISO 字串，回傳純 JSON
    - [x] React Query Provider 移到 `ClientProviders.tsx`，由 layout 的 client component 包覆
    - [x] 修正 ReactQueryDevtools 匯入方式，解決 undefined 錯誤
    - [x] 實測序列化錯誤已完全解決

  - [x] 分類篩選
  - [x] 價格篩選
  - [x] 風格篩選
- [x] 商品詳細頁面（mock資料已仿真真實商品頁）
  - [x] 圖片/影片輪播
  - [x] 商品說明
  - [x] 價格顯示
  - [x] mock資料仿真真品
  - [x] 愛心功能（前端狀態）
  - [x] 收藏功能（前端狀態）
  - [x] 加入購物車按鈕（前端狀態，含提示）
  - [x] 加入購物車有提示，其他無
  - [x] 修復商品詳情頁 `params.id` 異步問題 (Next.js 提示 `params` 應 `await`)

### 2.4 購物流程
- [x] 購物車頁面
  - [x] 商品列表
  - [x] 數量調整
  - [x] 刪除商品
  - [x] 總計計算
  - [x] 調整購物車空狀態時的訊息與按鈕間距 (UI優化)
- [x] 結帳流程
  - [x] 配送資訊表單
  - [x] 付款方式選擇
  - [x] 訂單確認頁面
- [x] 訂單查詢頁面
  - [x] 訂單列表
  - [x] 訂單詳情
  - [x] 物流追蹤

### 2.5 會員系統
- [ ] 會員中心頁面
  - [x] 漢堡選單顯示會員名稱 (登入狀態)
- [ ] 訂單記錄
- [ ] 收藏清單
- [ ] 帳戶設定

## 3. 後端開發
<!--
後端開發任務，包含 API、認證、商品、訂單、會員等模組。
也記錄第三方整合與監控。
-->

### 3.1 基礎設置
- [x] 設置 NestJS 項目
  - [x] 初始化 NestJS 專案
  - [x] 配置資料庫連線 (PostgreSQL + TypeORM)
  - [x] 設定環境變數 (.env)
- [x] 設置 JWT 驗證 
- [x] 設置 Swagger API 文件
- [x] 設置 Winston 日誌
- [x] 設置 New Relic/Datadog 監控

### 3.2 API 開發
- [ ] 認證 API (此階段可暫緩)
- [x] 商品 API
  - [x] 獲取商品列表 (GET /products)
  - [x] 獲取商品詳情 (GET /products/:id)
  - [ ] 新增商品 (POST /products) (需要管理員權限)
  - [ ] 更新商品 (PATCH /products/:id) (需要管理員權限)
  - [ ] 刪除商品 (DELETE /products/:id) (需要管理員權限)
  - [x] 定義 Product 資料庫模型 (Schema/Entity)
    - [x] 基本欄位：id, name, description, price, stock, category, images
    - [x] 時間戳記：createdAt, updatedAt
  - [x] 建立 Product 資料庫表格
  - [x] 修正重複的 product/products 表格問題（合併至單一 products 表格）
  - [ ] 商品核心 API 開發
    - [ ] 實作 ProductService 基本操作
    - [ ] 實作 GET /api/products (產品列表 API)
      - [ ] 基本分頁功能 (skip/take)
      - [ ] 基本排序功能 (價格、上架時間)
    - [ ] 實作 GET /api/products/:id (單一產品詳細 API)
  - [ ] 建立產品資料填充腳本 (Data Seeding)
    - [ ] 準備 10-15 個測試產品資料
    - [ ] 實作命令列填充工具
  - [ ] 前後端整合
    - [ ] 更新前端產品列表頁對接 API
    - [ ] 更新前端產品詳細頁對接 API
  - [ ] 管理功能 (建議第二階段實作)
    - [ ] 實作 POST /api/products (新增產品)
    - [ ] 實作 PUT /api/products/:id (更新產品)
    - [ ] 實作 DELETE /api/products/:id (刪除產品)
  - [ ] 單元測試 (等核心功能完成後)
- [ ] 購物車 API
  - [ ] 購物車基礎架構
    - [ ] 建立 Cart 資料庫模型 (Schema/Entity)
    - [ ] 建立 CartItem 資料庫模型 (Schema/Entity)
    - [ ] 建立 CartService 服務層
    - [ ] 建立 CartController 控制器
  - [ ] 購物車 API 端點
    - [ ] GET /api/cart - 獲取當前用戶購物車
    - [ ] POST /api/cart/items - 添加商品到購物車
    - [ ] PATCH /api/cart/items/:itemId - 更新購物車商品數量
    - [ ] DELETE /api/cart/items/:itemId - 從購物車移除商品
    - [ ] DELETE /api/cart - 清空購物車
  - [ ] 前端購物車服務
    - [ ] 建立 cart.ts API 服務
    - [ ] 實現購物車相關的 React Query hooks
  - [ ] 購物車狀態管理
    - [ ] 更新 CartContext 以支持 API 集成
    - [ ] 實現樂觀更新
    - [ ] 處理離線狀態
  - [ ] 購物車頁面優化
    - [ ] 加載狀態處理
    - [ ] 錯誤處理與用戶反饋
    - [ ] 空狀態處理
  - [ ] 測試
    - [ ] 單元測試 API 服務
    - [ ] 整合測試購物車流程
    - [ ] E2E 測試購物車功能
- [ ] 訂單 API
  - [ ] 建立訂單
  - [ ] 查詢訂單
  - [ ] 更新訂單狀態
- [ ] 會員 API
  - [ ] 會員資料
  - [ ] 收藏管理
  - [ ] 訂單查詢

### 3.3 第三方整合
- [ ] 設置 TapPay 金流整合
- [ ] 設置 Cloudinary 媒體儲存
- [ ] 設置 Email 服務（SendGrid/Mailgun）
- [ ] 設置簡訊服務（Twilio）
- [ ] 設置 Google Maps API

## 4. 資料庫設計
<!--
資料庫表結構、關聯、欄位設計等。
-->

### 4.0 資料庫遷移
- [x] 設定 TypeORM 遷移系統
- [x] 處理重複表格問題（合併 product 和 products 表格）

### 4.1 資料庫表
- [ ] 會員表
- [x] 商品表（products）
- [ ] 訂單表
- [ ] 購物車表
- [ ] 收藏表
- [ ] 物流表

### 4.2 資料庫索引
- [ ] 常用查詢索引
- [ ] 圖片/影片索引
- [ ] 搜尋優化索引

## 5. 部署與運維

### 5.1 部署設置
- [ ] 設置 Vercel 前端部署
- [ ] 設置 Railway/Render 後端部署
- [ ] 設置 Docker 容器

### 5.2 CI/CD
- [ ] 設置 GitHub Actions
  - [ ] 單元測試
  - [ ] 靜態分析
  - [ ] 自動部署

### 5.3 監控與維護
- [ ] 設置 Sentry 監控
- [ ] 設置日誌收集
- [ ] 設置效能監控

## 6. 測試與驗證
<!--
測試與驗證相關任務，包含單元測試、統合測試、壓力測試。
-->

### 6.1 單元測試
- [ ] 前端測試
- [ ] 後端測試
- [ ] API 測試

### 6.2 統合測試
- [ ] 購物流程測試
- [ ] 收藏功能測試
- [ ] 物流追蹤測試

### 6.3 壓力測試
- [ ] 并發請求測試
- [ ] 資料庫負載測試
- [ ] 金流壓力測試
