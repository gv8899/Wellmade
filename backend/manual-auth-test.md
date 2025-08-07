# 手動認證測試指南

## 測試步驟

### 1. 打開測試頁面
訪問：http://localhost:3000/test-auth

### 2. 檢查初始狀態
- Status: 應該顯示 "unauthenticated"
- 用戶: 應該顯示 "未登入"
- 有 backendToken: 應該顯示 "否"

### 3. 點擊 "Google 登入"
- 應該跳轉到 Google OAuth 頁面
- URL 應該包含正確的 client_id 和 redirect_uri

### 4. 完成 Google 登入
- 選擇或登入 Google 帳號
- 授權應用程式權限
- 應該自動回到 http://localhost:3000/test-auth

### 5. 檢查登入後狀態
- Status: 應該顯示 "authenticated"
- 用戶: 應該顯示您的 Google email
- 有 backendToken: 應該顯示 "是"
- 角色: 應該顯示 "user"
- 用戶 ID: 應該顯示 UUID 格式的 ID

### 6. 測試功能按鈕

#### 測試 Session 按鈕
- 點擊後應在日誌中顯示完整的 session 資料
- 應該包含 backendToken、userId、roles 等欄位

#### 測試購物車綁定按鈕
- 點擊後應返回 200 狀態碼
- 應該成功執行購物車綁定

#### 測試後端同步按鈕
- 點擊後應返回包含用戶資料和 accessToken 的回應

### 7. 測試購物車功能

#### 添加商品到購物車
在瀏覽器 console 中執行：
```javascript
fetch('/api/cart/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    productId: '3c0e65bb-27f5-4857-afe3-c6d987fb6fb5',
    quantity: 1,
    specs: {}
  })
}).then(r => r.json()).then(console.log);
```

#### 檢查購物車頁面
訪問：http://localhost:3000/cart
- 應該顯示剛添加的商品，而不是 "0 件商品"
- 如果仍顯示 "0 件商品"，自動修復機制應該在幾秒內啟動

### 8. 檢查 Console 日誌

在 NextAuth 回調過程中，應該看到類似的日誌：
```
🔥 NextAuth JWT callback called: { hasAccount: true, hasUser: true, provider: 'google', ... }
🔥 正在將用戶資料同步到後端...
🔥 使用後端 URL: http://localhost:3003
🔥 發送到後端的資料: { email: "...", name: "...", picture: "...", provider: "google" }
🔥 後端響應狀態: 200
🔥 用戶資料已同步到後端: { user: {...}, accessToken: "..." }
🔥 NextAuth: Google OAuth token updated: { userId: "...", roles: ["user"], hasBackendToken: true }
```

### 9. 預期結果

✅ **成功的指標**：
- 用戶能成功登入
- Session 包含有效的 backendToken
- 購物車綁定 API 返回 200
- 添加商品後購物車頁面顯示商品而不是 "0 件商品"

❌ **失敗的指標**：
- 登入後 backendToken 仍為空
- 購物車綁定返回 401 錯誤
- 購物車頁面仍顯示 "0 件商品" 且無自動修復

## 問題排查

### 如果 backendToken 為空
1. 檢查 Console 是否有 NextAuth JWT 回調日誌
2. 檢查後端 oauth-sync 端點是否返回 200
3. 檢查 BACKEND_URL 環境變數是否正確

### 如果購物車仍顯示空
1. 檢查是否有 "[CART] 檢測到已登入用戶但購物車為空，嘗試修復" 日誌
2. 檢查 force-bind API 是否返回 200
3. 檢查資料庫中是否有購物車項目

### 如果完全無法登入
1. 檢查 Google OAuth 配置（client_id, client_secret）
2. 檢查 NEXTAUTH_SECRET 和 NEXTAUTH_URL 環境變數
3. 檢查 Google Cloud Console 中的 OAuth 回調 URL 設定