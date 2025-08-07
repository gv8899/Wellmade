# ProductHero 手機端滑動測試指南

## 快速測試步驟

### 1. 準備測試環境
```bash
# 確保服務正在運行
curl http://localhost:3000 # 前端服務檢查
curl http://localhost:3003/products # 後端服務檢查
```

### 2. 開啟測試頁面
在 Chrome 瀏覽器中訪問：
```
http://localhost:3000/product/57d995b3-3511-4db4-86a7-a8c773a45f7c
```

### 3. 切換到手機模式
1. 按 `F12` 開啟開發者工具
2. 按 `Ctrl+Shift+M` (Windows) 或 `Cmd+Shift+M` (Mac) 切換手機模式
3. 選擇設備：**iPhone 12 Pro** (375 x 812)

### 4. 執行測試檢查

#### 🔍 基礎功能檢查
在控制台中執行：
```javascript
// 檢查組件載入
const hero = document.querySelector('[data-testid="product-hero"]');
const container = hero?.querySelector('.flex.w-full.h-full');
const images = container?.querySelectorAll('img');
const dots = hero?.querySelectorAll('button[aria-label^="切換到圖片"]');

console.log('✅ 檢查結果:');
console.log('- ProductHero:', !!hero);
console.log('- 滑動容器:', !!container);
console.log('- 圖片數量:', images?.length);
console.log('- 圓點數量:', dots?.length);
```

#### 🎯 圓點點擊測試
```javascript
// 測試圓點點擊功能
const dots = document.querySelectorAll('[data-testid="product-hero"] button');
if (dots.length > 1) {
  console.log('🔘 點擊第二個圓點...');
  dots[1].click();
  
  setTimeout(() => {
    const container = document.querySelector('[data-testid="product-hero"] .flex.w-full.h-full');
    console.log('Transform:', container?.style.transform);
    
    dots.forEach((dot, i) => {
      const active = dot.getAttribute('data-active');
      console.log(`圓點 ${i}:`, active === 'true' ? '🟢 激活' : '⚪ 未激活');
    });
  }, 500);
}
```

#### 📱 觸摸滑動測試
**手動操作**：
1. 在圖片區域按住滑鼠左鍵
2. 從右向左拖拽（模擬手指滑動）
3. 觀察圖片是否跟隨移動
4. 鬆開滑鼠，檢查是否自動對齊到下一張

**預期現象**：
- ✅ 圖片跟隨手指流暢移動
- ✅ 鬆手後平滑切換到下一張
- ✅ 圓點指示器正確更新
- ✅ 控制台顯示調試信息

### 5. 觀察調試輸出

在進行滑動操作時，控制台應該顯示：
```
設置位置: 0
點擊圓點: 1 當前索引: 0
設置位置: -375
圓點 0: 激活狀態 = false, 當前索引 = 1
圓點 1: 激活狀態 = true, 當前索引 = 1
滑動中: {currentPosition: 200, diff: -100, newTranslate: -100, prevTranslate: 0}
設置位置: -100
設置位置: -375
```

### 6. 測試場景清單

#### ✅ 成功標準
- [ ] 頁面正確載入 ProductHero 組件
- [ ] 顯示多張圖片和對應圓點
- [ ] 圓點點擊立即切換圖片
- [ ] 圓點激活狀態正確顯示
- [ ] 觸摸滑動有跟隨效果
- [ ] 滑動結束自動對齊
- [ ] 控制台顯示正確調試信息
- [ ] 沒有 JavaScript 錯誤

#### ⚠️ 常見問題
1. **圖片不跟隨滑動**
   - 檢查 transform 值是否變化
   - 確認 isDragging 狀態正確

2. **圓點狀態不更新**
   - 檢查 currentImageIndex 是否正確
   - 確認 data-active 屬性更新

3. **滑動不流暢**
   - 檢查 requestAnimationFrame 是否正常
   - 確認事件處理沒有被阻塞

### 7. 效能測試

#### 記憶體使用
```javascript
// 檢查記憶體使用（可選）
console.log('記憶體使用:', performance.memory);
```

#### 動畫性能
- 打開 Performance 面板
- 記錄滑動操作
- 檢查 FPS 是否穩定在 60fps

### 8. 不同設備測試

推薦測試的設備尺寸：
- iPhone SE (375 x 667)
- iPhone 12 Pro (390 x 844)
- Samsung Galaxy S20 (360 x 800)
- iPad (768 x 1024)

### 9. 回歸測試

確保修復沒有破壞其他功能：
- [ ] 桌面端滑鼠拖拽正常
- [ ] 鍵盤導航可用
- [ ] 圖片載入正確
- [ ] 其他產品頁面功能正常

## 測試結果記錄

### ✅ 通過的測試
- 組件正確載入
- 圓點點擊功能
- 觸摸滑動跟隨
- 狀態同步正確

### ❌ 發現的問題
(請記錄任何發現的問題)

### 📝 改進建議
(請記錄任何改進建議)

---

**測試完成後，請提供詳細的測試結果反饋，包括：**
1. 所有測試項目的通過/失敗狀態
2. 控制台調試輸出的具體內容
3. 發現的任何異常行為
4. 整體滑動體驗的改善程度評分 (1-10分)