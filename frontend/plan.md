# 購物車系統串接規劃

## 目前購物車系統分析

根據現有代碼，購物車系統目前使用的是:
- 開發模式下使用 localStorage 模擬 API 行為
- 使用 `CartContext` 全局管理購物車狀態
- 基本功能：添加、刪除、更新商品數量、清空購物車
- 已有樂觀更新機制

## 串接需求

需要根據會員和非會員情況處理購物車數據:
1. **非會員**：繼續使用本地存儲，但在用戶登入時能夠同步數據
2. **會員**：通過 API 從伺服器獲取和操作購物車數據
3. **跨裝置同步**：會員可以在不同裝置看到同一購物車內容
4. **合併機制**：用戶從非會員轉為會員時，合併本地購物車與會員購物車數據

## 技術實現方案

### 1. API 端點設計

需要實現以下端點:
```typescript
// API 端點
const CART_API = {
  GET_CART: '/api/cart',                 // 獲取當前用戶的購物車
  ADD_ITEM: '/api/cart/items',           // 添加商品到購物車
  UPDATE_ITEM: '/api/cart/items/:id',    // 更新購物車商品數量
  REMOVE_ITEM: '/api/cart/items/:id',    // 從購物車中移除商品
  CLEAR_CART: '/api/cart',               // 清空購物車
  MERGE_CART: '/api/cart/merge'          // 合併本地購物車到用戶帳號
};
```

### 2. 資料結構

```typescript
// 購物車項目
interface CartItem {
  id: string;            // 購物車項目 ID
  productId: string;     // 產品 ID
  name: string;          // 產品名稱
  price: number;         // 價格
  quantity: number;      // 數量
  cover: string;         // 圖片 URL
  specs: {               // 規格選項
    [key: string]: string;
  };
}

// 購物車響應
interface CartResponse {
  items: CartItem[];    // 購物車項目
  total: number;        // 總金額
  count: number;        // 商品總數
}
```

### 3. 會員和非會員處理

#### 非會員處理:
- 繼續使用 localStorage 存儲購物車數據
- 在用戶界面顯示登入按鈕，鼓勵用戶登入以保存購物車
- 提供臨時購物車 ID (使用 UUID 或其他方式)，可用於後續合併操作

#### 會員處理:
- 登入後通過 API 獲取用戶購物車數據
- 所有購物車操作都通過 API 進行，以確保數據同步
- 提供強制刷新機制，允許用戶手動同步購物車數據

### 4. 登入時購物車合併處理

當用戶從非會員狀態登入成為會員時，需要處理購物車數據合併:

1. 檢測本地是否有購物車數據
2. 如果有，調用 MERGE_CART API 將本地數據發送到服務器
3. 服務器執行合併邏輯 (例如同商品數量相加，衝突時保留較新數據)
4. 返回合併後的購物車數據
5. 清空本地購物車，使用服務器返回的數據

```typescript
// 購物車合併流程示例
const mergeCartsOnLogin = async () => {
  const localCart = localCartStorage.getCart();
  if (localCart.length > 0) {
    try {
      const response = await axios.post('/api/cart/merge', { items: localCart });
      if (response.data.success) {
        // 更新購物車為合併後的數據
        setCartItems(response.data.data);
        // 清空本地購物車
        localCartStorage.saveCart([]);
      }
    } catch (error) {
      console.error('合併購物車失敗:', error);
      // 失敗處理邏輯
    }
  }
};
```

## 具體實現步驟

### 1. 修改 CartContext.tsx

1. 添加用戶登入狀態檢查
2. 根據登入狀態決定使用 API 還是本地存儲
3. 添加購物車合併功能
4. 優化錯誤處理邏輯

### 2. 修改 cart.ts 服務

1. 將 mock 函數調整為正確的 API 調用
2. 添加認證頭部處理
3. 添加新的 API 端點 (如合併購物車)

### 3. 修改購物車頁面

1. 添加登入狀態和非登入狀態的視覺差異
2. 對非會員用戶顯示登入提示
3. 添加購物車同步狀態指示器

### 4. 用戶登入流程更新

1. 在登入成功後調用購物車合併函數
2. 提供合併成功的提示

## 測試計劃

1. **非會員測試**:
   - 添加商品到購物車
   - 驗證數據存儲在 localStorage
   - 確認關閉瀏覽器後數據保留

2. **會員測試**:
   - 登入用戶帳號
   - 驗證能夠獲取服務器上的購物車數據
   - 測試添加、更新、刪除操作與服務器同步

3. **跨設備同步測試**:
   - 在多個設備上使用同一會員帳號登入
   - 驗證購物車數據是否同步

4. **合併測試**:
   - 非會員狀態下添加商品
   - 登入會員帳號
   - 驗證本地購物車是否正確合併到會員購物車

## 後續優化

1. **離線支持**:
   - 實現離線時使用本地數據，在線時與服務器同步
   - 添加網絡恢復後自動同步機制

2. **性能優化**:
   - 購物車數據緩存策略
   - 減少不必要的 API 調用

3. **用戶體驗**:
   - 添加購物車操作動畫
   - 提供更明確的同步狀態提示

4. **安全性**:
   - 防止惡意購物車操作
   - 添加數據驗證機制
