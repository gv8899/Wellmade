# 產品更新 categoryId 問題分析報告

## 問題描述
產品更新時，categoryId 欄位無法被正確更新到資料庫，但其他欄位（如 name）可以正常更新。

## 調試過程發現

### 1. 實際的 SQL 執行
- ✅ Object.assign() 後的 save() 正確執行
- ❌ categoryId 欄位未被包含在 UPDATE 語句中  
- ✅ 其他欄位（name）更新時 updatedAt 會正確變化
- ❌ categoryId 更新時 updatedAt 保持不變，說明 UPDATE 語句未執行

### 2. 事務和回滾
- ✅ 無事務回滾問題
- ✅ 變體處理不影響產品更新

### 3. 資料驗證和轉換  
- ✅ DTO 驗證正確
- ✅ categoryId 值被正確處理（無 null/undefined 問題）
- ✅ 分類存在性檢查通過

### 4. 實體更新邏輯的核心問題

#### Object.assign 行為
```typescript
// 這部分工作正常
const updatedProduct = Object.assign(product, updateProductDto);
console.log(updatedProduct.categoryId); // 顯示正確的新值
```

#### save() 方法執行
```typescript
// save() 被調用但 categoryId 更新被忽略
const savedProduct = await this.productRepository.save(updatedProduct);
console.log(savedProduct.categoryId); // 仍然是舊值
```

#### 最終查詢問題
```typescript
// 重新查詢可能覆蓋更新結果
const finalProduct = await this.findOne(id);
// categoryRelation 載入可能與 categoryId 衝突
```

## 根本原因分析

### TypeORM 實體關聯衝突
Product 實體同時定義了：
```typescript
@Column({ nullable: true })
categoryId: string;

@ManyToOne(() => Category, category => category.products, { nullable: true })
@JoinColumn({ name: 'categoryId' })
categoryRelation: Category;
```

這可能導致：
1. **實體狀態追踪衝突** - TypeORM 可能認為 categoryId 沒有真正改變
2. **關聯載入覆蓋** - 載入 categoryRelation 時覆蓋了 categoryId 的變更
3. **JoinColumn 配置問題** - 外鍵欄位和關聯物件的狀態不一致

### 測試證據
- 更新 `name`: ✅ 成功，updatedAt 變化
- 更新 `categoryId`: ❌ 失敗，updatedAt 不變
- 更新其他非關聯欄位: ✅ 成功

## 建議的修復方案

### 方案 1: 移除更新後的關聯查詢
```typescript
// 直接返回保存結果，不重新載入關聯
return savedProduct;
```

### 方案 2: 使用 QueryBuilder 原生更新
```typescript
await this.productRepository
  .createQueryBuilder()
  .update(Product)
  .set({ categoryId: updateProductDto.categoryId })
  .where("id = :id", { id })
  .execute();
```

### 方案 3: 強制重新整理實體
```typescript
await this.productRepository.save(updatedProduct);
await this.productRepository.manager.refresh(updatedProduct);
```

### 方案 4: 分離關聯管理
```typescript
// 先更新基本欄位，再單獨處理關聯
if (updateProductDto.categoryId !== undefined) {
  await this.productRepository.update(id, { categoryId: updateProductDto.categoryId });
}
```

## 推薦解決方案
建議採用方案 2（QueryBuilder）結合方案 3（強制重新整理），確保資料庫更新的準確性和實體狀態的一致性。