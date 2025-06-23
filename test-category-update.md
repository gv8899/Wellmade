# 產品分類更新測試指南

## 問題描述
產品分類更新後，在管理員產品列表中沒有顯示新的分類名稱，仍然顯示舊的分類資訊。

## 已修復的問題

### 1. 後端 API 關聯資料不完整
**位置**: `/backend/src/admin/admin.service.ts`
**問題**: 管理員產品列表查詢缺少分類關聯資料
**修復**: 在 `getAllProducts` 和 `getProductById` 方法中添加 `'categoryRelation'` 關聯

### 2. 前端產品列表顯示邏輯
**位置**: `/frontend/src/app/admin/products/page.tsx`
**問題**: 仍使用舊的 `product.category` 欄位顯示分類
**修復**: 更新為優先使用 `product.categoryRelation?.name`

### 3. 產品更新後關聯資料不完整
**位置**: `/backend/src/admin/admin.service.ts`
**問題**: 產品更新後沒有重新載入完整的關聯資料
**修復**: 在 `updateProduct` 和 `createProduct` 方法中添加重新載入邏輯

### 4. 分類篩選功能不一致
**位置**: `/backend/src/admin/admin.service.ts`
**問題**: 管理員分類篩選仍使用舊的 category 欄位
**修復**: 更新為支援新的 categoryId 關聯

## 測試步驟

### 1. 測試產品分類更新
1. 啟動後端服務: `cd backend && npm run start:dev`
2. 啟動前端服務: `cd frontend && npm run dev`
3. 登入管理員帳號
4. 進入產品管理頁面
5. 編輯一個產品，更改其分類
6. 保存後回到產品列表
7. 驗證分類是否正確顯示

### 2. 測試分類篩選功能
1. 在產品列表頁面使用分類篩選
2. 驗證篩選結果是否正確

### 3. 測試新建產品
1. 新建一個產品並選擇分類
2. 確認產品列表中顯示正確的分類

## 相關檔案
- `/backend/src/admin/admin.service.ts` - 後端管理員服務
- `/frontend/src/app/admin/products/page.tsx` - 前端產品列表頁面
- `/frontend/src/components/admin/ProductForm.tsx` - 產品表單組件
- `/frontend/src/services/admin.ts` - 前端管理員 API 服務

## 預期結果
- 產品分類更新後，管理員產品列表立即顯示新的分類名稱
- 分類篩選功能正常工作
- 新建產品的分類顯示正確
- 產品詳情頁面的分類資訊與列表頁面一致