# CLAUDE.md

這個檔案為在此程式碼庫中工作的 Claude Code (claude.ai/code) 提供指導。

## 專案概述

Wellmade 是一個內容導向的電商平台，採用 Instagram 風格的商品展示。使用 Next.js 前端和 NestJS 後端構建，具備完整的電商功能包含商品管理、品牌管理、分類系統、購物車、訂單處理、藍新金流支付整合和 Google OAuth 認證。專案已配置支援本機開發和 Zeabur 雲端部署。

## 部署環境

- **生產環境域名**: 
  - 前端: https://wellmade.select
  - 後端 API: https://api.wellmade.select
- **部署平台**: Zeabur
- **資料庫**: PostgreSQL (Zeabur 托管)

## 核心指令

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
- **模組結構**: Auth, Products, Brands, Categories, Carts, Users, Orders, Payment, Admin
- **資料庫**: PostgreSQL 搭配 TypeORM 遷移
- **認證**: JWT + Passport 搭配 Google OAuth
- **關鍵模式**: 
  - 使用 `@Public()` 裝飾器標記公開端點
  - 基於角色的守衛用於管理員功能
  - JSONB 欄位用於豐富的商品內容 (keyFeatures, featureDetails, faqs)
- **支付整合**: 藍新金流 (Newebpay)
- **檔案上傳**: 透過 UploadsController 處理，支援圖片縮圖生成

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
- **商品 (Products)**: 豐富內容搭配品牌關聯，JSONB 欄位用於功能/常見問題，支援多變體管理
- **分類 (Categories)**: 階層式結構，支援 SEO 優化欄位 (metaTitle, metaDescription)
- **品牌 (Brands)**: 品牌資訊管理，與商品多對一關聯
- **購物車 (Carts)**: 支援訪客和認證用戶，自動合併機制
- **用戶 (Users)**: 基於角色 (admin, user, editor) 搭配 Google OAuth 同步
- **訂單 (Orders)**: 
  - 訂單主表：狀態流轉 (pending → processing → paid → shipped → delivered)
  - 訂單項目：商品快照保存，確保歷史資料完整性
  - 自動編號生成：ORD-YYYYMMDD-XXXXX
- **支付記錄 (PaymentRecords)**: 
  - 交易狀態追蹤 (pending → paid/failed → refunded)
  - 藍新金流交易資料儲存
  - 支援重試機制

## 開發流程

1. **資料庫設定**: 執行遷移後填充資料
2. **雙伺服器**: 後端 (port 3003) 和前端 (port 3000)
3. **型別安全**: 前後端共享介面
4. **購物車系統**: 樂觀更新搭配本地儲存回退
5. **環境切換**: 本機開發與部署環境透過環境變數無縫切換

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

## 關鍵實作細節

- **商品管理**: 
  - 豐富媒體輪播搭配 JSONB 儲存的功能詳情
  - 支援多變體管理（尺寸、顏色等）
  - SKU 自動生成系統
- **購物車系統**: 
  - 混合訪客/認證系統搭配樂觀更新
  - 自動合併機制，登入時合併訪客購物車
  - 本地儲存備份，離線支援
- **訂單處理**: 
  - 完整狀態機管理訂單生命週期
  - 商品資訊快照，保證歷史資料一致性
  - 自動編號生成，格式化訂單追蹤
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
- **檔案處理**: 
  - 圖片上傳自動生成縮圖 (original, medium, thumbnail)
  - 支援批次上傳和進度追蹤
- **跨域支援**: 
  - 動態 CORS 配置，支援多域名
  - 包含 Zeabur 子域名自動識別

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
- `/api/brands/*` - 品牌管理
- `/api/categories/*` - 分類管理
- `/api/carts/*` - 購物車操作
- `/api/orders/*` - 訂單管理
- `/api/payment/*` - 支付處理（創建、回調、查詢）
- `/api/admin/*` - 管理員功能
- `/api/uploads/*` - 檔案上傳

### 前端 API 代理
- `/api/auth/callback/google` - Google OAuth 回調
- `/api/brands/*` - 品牌資料代理
- `/api/categories/*` - 分類資料代理
- `/api/products/*` - 商品資料代理
- `/api/cart/*` - 購物車操作代理
- `/api/orders/*` - 訂單操作代理