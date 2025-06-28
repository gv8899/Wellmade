# Zeabur 部署指南

## 部署前準備

### 1. 域名設定
- 確保已將 `wellmade.select` 域名的 DNS 準備好
- 部署完成後需要將域名 CNAME 指向 Zeabur 提供的域名

### 2. Google OAuth 設定
在 [Google Cloud Console](https://console.cloud.google.com) 中：
- 新增授權的重新導向 URI: `https://wellmade.select/api/auth/callback/google`
- 新增授權的 JavaScript 來源: `https://wellmade.select`

### 3. 金流設定
更新藍新金流的回調 URL：
- Return URL: `https://your-backend.zeabur.app/payment/return`
- Notify URL: `https://your-backend.zeabur.app/payment/notify`
- Client Back URL: `https://wellmade.select/checkout/success`

## 部署步驟

### 步驟 1: 部署後端服務

1. 在 Zeabur 建立新專案
2. 選擇從 Git 匯入，選擇 `backend` 資料夾
3. 添加 PostgreSQL 服務
4. 設定環境變數：

```env
# 資料庫 (Zeabur 自動提供)
DATABASE_URL=<自動生成>

# JWT
JWT_SECRET=<使用 openssl rand -base64 32 生成>
JWT_EXPIRES_IN=1d

# Google OAuth
GOOGLE_CLIENT_ID=<你的 Google Client ID>
GOOGLE_CLIENT_SECRET=<你的 Google Client Secret>
GOOGLE_CALLBACK_URL=https://wellmade.select/api/auth/callback/google

# 前端 URL
FRONTEND_URL=https://wellmade.select

# Session
SESSION_SECRET=<使用 openssl rand -base64 32 生成>

# 環境
NODE_ENV=production
NODE_OPTIONS=--experimental-global-webcrypto

# 金流
NEWEBPAY_MERCHANT_ID=<你的商店代號>
NEWEBPAY_HASH_KEY=<你的 Hash Key>
NEWEBPAY_HASH_IV=<你的 Hash IV>
NEWEBPAY_API_URL=https://ccore.newebpay.com/MPG/mpg_gateway
NEWEBPAY_RETURN_URL=https://api.wellmade.select/payment/return
NEWEBPAY_NOTIFY_URL=https://api.wellmade.select/payment/notify
NEWEBPAY_CLIENT_BACK_URL=https://wellmade.select/checkout/success
```

5. 部署完成後記下後端的 URL

### 步驟 2: 部署前端服務

1. 在同一個專案中添加新服務
2. 選擇從 Git 匯入，選擇 `frontend` 資料夾
3. 設定環境變數：

```env
# NextAuth
NEXTAUTH_URL=https://wellmade.select
NEXTAUTH_SECRET=<與後端相同的 secret>

# Google OAuth
GOOGLE_CLIENT_ID=<與後端相同>
GOOGLE_CLIENT_SECRET=<與後端相同>

# API
API_URL=https://api.wellmade.select/api
NEXT_PUBLIC_API_URL=https://api.wellmade.select
BACKEND_URL=https://api.wellmade.select
```

4. 綁定自訂域名 `wellmade.select`

### 步驟 3: 設定域名

1. 在 Zeabur 控制台中，為前端服務綁定 `wellmade.select`
2. 取得 CNAME 記錄
3. 在你的 DNS 提供商設定 CNAME 記錄

### 步驟 4: 驗證部署

1. 訪問後端健康檢查：`https://<後端域名>.zeabur.app/health`
2. 訪問前端：`https://wellmade.select`
3. 測試登入功能
4. 測試購物車功能

## 注意事項

1. **資料庫遷移**：後端的 `zeabur.json` 已配置自動執行遷移
2. **CORS**：後端已配置支援 `wellmade.select` 域名
3. **環境變數**：確保所有 secret 都使用強密碼
4. **SSL**：Zeabur 會自動提供 SSL 證書

## 故障排除

### 前端無法連接後端
- 檢查 `BACKEND_URL` 環境變數是否正確
- 檢查後端 CORS 設定
- 查看瀏覽器 Console 錯誤訊息

### Google 登入失敗
- 確認 Google OAuth 回調 URL 設定正確
- 檢查 `NEXTAUTH_URL` 是否為 `https://wellmade.select`

### 資料庫連線失敗
- 確認 PostgreSQL 服務正常運行
- 檢查資料庫環境變數設定
- 查看後端日誌確認連線資訊