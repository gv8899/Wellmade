# CLAUDE.md

這個檔案為在此程式碼庫中工作的 Claude Code (claude.ai/code) 提供指導。

## 專案概述

Wellmade 是一個內容導向的電商平台，採用 Instagram 風格的商品展示。使用 Next.js 前端和 NestJS 後端構建，具備豐富的商品圖庫、購物車功能、訂單管理、支付系統和 Google OAuth 認證。專案已配置支援本機開發和 Zeabur 雲端部署。

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
  - Context 層級結構: AuthProvider > UserProvider > CartProvider
  - API 服務層，具備模擬資料回退機制
  - 購物車樂觀更新搭配伺服器同步
- **圖片處理**: 使用 Next.js Image 組件，支援遠端圖片最佳化

### 資料庫結構
- **商品**: 豐富內容搭配品牌關聯，JSONB 欄位用於功能/常見問題
- **購物車**: 支援訪客和認證用戶
- **用戶**: 基於角色 (admin, user, editor) 搭配 Google OAuth 同步
- **訂單**: 完整的訂單追蹤和狀態管理
- **支付**: 支付記錄與交易狀態追蹤

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

- **商品頁面**: 豐富媒體輪播搭配 JSONB 儲存的功能詳情
- **購物車**: 混合訪客/認證系統搭配樂觀更新
- **認證**: 雙重 NextAuth.js 前端 + NestJS JWT 後端
- **API 容錯**: 後端不可用時回退到模擬資料
- **資料庫**: 遷移優先方式，所有結構變更透過 TypeORM 遷移
- **圖片上傳**: 自動生成縮圖，支援多種尺寸 (original, medium, thumbnail)
- **CORS 配置**: 動態支援多個域名，包含 Zeabur 子域名

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

2. **漸進式部署**:
   - 先部署後端，確認 API 正常
   - 再部署前端，確認整體功能

3. **監控與日誌**:
   - 利用 Zeabur 的日誌功能追蹤問題
   - 後端已配置詳細的錯誤日誌

4. **版本控制**:
   - 使用語意化版本號
   - 重要變更記錄在 git commit 中