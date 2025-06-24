# 產品變體架構重構提案

## 問題描述

當前產品變體架構存在邏輯不一致問題：
- 主產品可購買但缺乏明確規格定義
- 用戶面對4個購買選項（主產品+3變體）而非預期的3個
- SKU管理複雜化，庫存邏輯混亂

## 重構目標

將當前的"主產品+變體"模式重構為"容器+變體"模式，實現：
- 主產品僅作為變體容器，不可直接購買
- 所有可購買項目都是明確定義的變體
- 清晰的SKU和庫存管理

## 技術實現方案

### 1. 資料庫結構調整

#### Product Entity 修改
```typescript
export class Product {
  // ... 現有欄位
  
  // 新增：是否為容器產品
  @Column({ default: false })
  isContainer: boolean;
  
  // 修改：容器產品不應有獨立價格/庫存
  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  price: string; // 容器產品為 null
  
  @Column({ default: 0 })
  stock: number; // 容器產品為 0
  
  @Column({ nullable: true })
  masterSku: string; // 容器產品無 SKU
}
```

#### 遷移腳本
```sql
-- 1. 添加 isContainer 欄位
ALTER TABLE products ADD COLUMN is_container BOOLEAN DEFAULT FALSE;

-- 2. 將有變體的產品標記為容器
UPDATE products 
SET is_container = TRUE,
    price = NULL,
    stock = 0,
    master_sku = NULL
WHERE id IN (
  SELECT DISTINCT product_id 
  FROM product_variants 
  WHERE is_active = TRUE
);

-- 3. 確保容器產品不可直接購買
UPDATE products 
SET status = 'CONTAINER'
WHERE is_container = TRUE;
```

### 2. 業務邏輯調整

#### Product Service
```typescript
// 獲取產品時自動計算容器產品的聚合信息
async findOneWithVariants(id: string) {
  const product = await this.productRepository.findOne({
    where: { id },
    relations: ['variants', 'brand', 'categoryRelation']
  });
  
  if (product.isContainer) {
    // 計算價格範圍
    const prices = product.variants.map(v => parseFloat(v.price));
    product.minPrice = Math.min(...prices);
    product.maxPrice = Math.max(...prices);
    
    // 計算總庫存
    product.totalStock = product.variants
      .filter(v => v.isActive)
      .reduce((sum, v) => sum + v.stock, 0);
    
    // 確定可用狀態
    product.isAvailable = product.variants.some(v => 
      v.isActive && v.stock > 0 && v.status === 'IN_STOCK'
    );
  }
  
  return product;
}
```

#### Cart Service
```typescript
// 購物車只允許添加變體，不允許添加容器產品
async addItemToCart(cartId: string, item: AddToCartDto) {
  if (item.productId && !item.variantId) {
    const product = await this.productService.findOne(item.productId);
    if (product.isContainer) {
      throw new BadRequestException(
        '此產品需要選擇具體規格才能加入購物車'
      );
    }
  }
  
  // ... 其餘邏輯
}
```

### 3. 前端界面調整

#### ProductPurchaseOptions 組件
```typescript
// 容器產品強制要求選擇變體
if (product.isContainer && !selectedVariant) {
  return (
    <div className="text-center py-4">
      <p className="text-gray-600 mb-4">請選擇規格：</p>
      <VariantSelector 
        variants={product.variants}
        onSelect={setSelectedVariant}
      />
    </div>
  );
}
```

#### 價格顯示
```typescript
// 容器產品顯示價格範圍
const displayPrice = product.isContainer 
  ? `¥${product.minPrice} - ¥${product.maxPrice}`
  : `¥${product.price}`;
```

### 4. 管理後台調整

#### ProductForm 組件
```typescript
// 創建產品時選擇模式
<div className="form-group">
  <label>產品類型</label>
  <select onChange={handleProductTypeChange}>
    <option value="simple">簡單產品（無變體）</option>
    <option value="container">容器產品（有變體）</option>
  </select>
</div>

{productType === 'container' && (
  <div className="alert alert-info">
    容器產品本身不可購買，用戶必須選擇具體變體
  </div>
)}
```

## 遷移策略

### 階段一：數據遷移
1. 備份現有數據
2. 執行遷移腳本
3. 驗證數據完整性

### 階段二：程式碼部署
1. 部署後端變更
2. 部署前端變更
3. 測試核心流程

### 階段三：清理優化
1. 清理冗餘代碼
2. 優化性能
3. 更新文檔

## 預期效果

### 用戶體驗
- ✅ 清晰的產品選擇流程
- ✅ 避免規格混淆
- ✅ 符合電商標準體驗

### 技術效果
- ✅ 一致的架構邏輯
- ✅ 簡化的SKU管理
- ✅ 準確的庫存追蹤
- ✅ 更好的擴展性

### 商業效果
- ✅ 減少用戶困惑
- ✅ 提高轉換率
- ✅ 便於庫存管理
- ✅ 支持複雜產品策略

## 風險評估

### 技術風險
- **中等**：需要修改核心業務邏輯
- **緩解**：充分測試，分階段部署

### 數據風險
- **低**：主要是狀態變更，不丟失數據
- **緩解**：完整備份，可回滾

### 業務風險
- **低**：改善用戶體驗，無負面影響
- **緩解**：A/B測試驗證效果

## 實施時間表

- **週1**：數據庫遷移腳本開發與測試
- **週2**：後端業務邏輯調整
- **週3**：前端界面重構
- **週4**：集成測試與部署
- **週5**：監控與優化

## 結論

此重構方案將解決當前變體架構的邏輯不一致問題，提供清晰的產品結構和更好的用戶體驗。建議盡快實施，以避免問題累積和技術債務加重。