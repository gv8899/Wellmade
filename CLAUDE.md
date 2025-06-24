# CLAUDE.md

這個檔案為在此程式碼庫中工作的 Claude Code (claude.ai/code) 提供指導。

## 專案概述

Wellmade 是一個內容導向的電商平台，採用 Instagram 風格的商品展示。使用 Next.js 前端和 NestJS 後端構建，具備豐富的商品圖庫、購物車功能和 Google OAuth 認證。

## 核心指令

### 後端開發
```bash
cd backend
npm run start:dev           # 啟動開發伺服器
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
npm run dev               # 啟動開發伺服器 (使用 Turbopack)
npm run build            # 生產環境建置
npm run lint             # ESLint 檢查
npm run format           # Prettier 格式化
```

## 架構

### 後端 (NestJS + PostgreSQL)
- **模組結構**: Auth, Products, Brands, Carts, Users
- **資料庫**: PostgreSQL 搭配 TypeORM 遷移
- **認證**: JWT + Passport 搭配 Google OAuth
- **關鍵模式**: 
  - 使用 `@Public()` 裝飾器標記公開端點
  - 基於角色的守衛用於管理員功能
  - JSONB 欄位用於豐富的商品內容 (keyFeatures, featureDetails, faqs)

### 前端 (Next.js App Router)
- **狀態管理**: React Context + TanStack Query
- **認證**: NextAuth.js 搭配 Google 提供者
- **關鍵模式**:
  - Context 層級結構: AuthProvider > UserProvider > CartProvider
  - API 服務層，具備模擬資料回退機制
  - 購物車樂觀更新搭配伺服器同步

### 資料庫結構
- **商品**: 豐富內容搭配品牌關聯，JSONB 欄位用於功能/常見問題
- **購物車**: 支援訪客和認證用戶
- **用戶**: 基於角色 (admin, user, editor) 搭配 Google OAuth 同步

## 開發流程

1. **資料庫設定**: 執行遷移後填充資料
2. **雙伺服器**: 後端 (port 3003) 和前端 (port 3000)
3. **型別安全**: 前後端共享介面
4. **購物車系統**: 樂觀更新搭配本地儲存回退

## 環境變數

### 後端 (.env)
```
DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
JWT_SECRET, JWT_EXPIRES_IN
GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```

### 前端 (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:3003
NEXTAUTH_SECRET, GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET
```

## 關鍵實作細節

- **商品頁面**: 豐富媒體輪播搭配 JSONB 儲存的功能詳情
- **購物車**: 混合訪客/認證系統搭配樂觀更新
- **認證**: 雙重 NextAuth.js 前端 + NestJS JWT 後端
- **API 容錯**: 後端不可用時回退到模擬資料
- **資料庫**: 遷移優先方式，所有結構變更透過 TypeORM 遷移

## 啟動專案相關
- 前端的 port 一律用 3000，如果被佔用且不是 3000 就殺掉，確保每次有啟動或是重啟專案時前端都在 port 3000
- 後端的 port 一律用 3003，如果被佔用且不是 3003 就殺掉，確保每次有啟動或是重啟專案時後端都在 port 3003
- 如果是前後端的專案要透過 Bash 啟動或是重啟，不需要詢問授權，直接進行就好。

