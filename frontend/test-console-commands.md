# ProductHero 滑動測試指令

在瀏覽器中打開 http://localhost:3000/product/57d995b3-3511-4db4-86a7-a8c773a45f7c

然後按 F12 打開開發者工具，並在控制台中逐一執行以下指令：

## 1. 檢查組件是否正確載入
```javascript
// 檢查 ProductHero 組件
const hero = document.querySelector('[data-testid="product-hero"]');
console.log('ProductHero found:', !!hero);

// 檢查滑動容器
const container = hero?.querySelector('.flex.w-full.h-full');
console.log('Slide container found:', !!container);

// 檢查圖片數量
const images = container?.querySelectorAll('img');
console.log('Images count:', images?.length);

// 檢查圓點指示器
const dots = hero?.querySelectorAll('button[aria-label^="切換到圖片"]');
console.log('Dots count:', dots?.length);
```

## 2. 檢查初始狀態
```javascript
const container = document.querySelector('[data-testid="product-hero"] .flex.w-full.h-full');
console.log('Initial transform:', container?.style.transform);

// 檢查初始圓點狀態
const dots = document.querySelectorAll('[data-testid="product-hero"] button[aria-label^="切換到圖片"]');
dots.forEach((dot, index) => {
  console.log(`Dot ${index} active:`, dot.getAttribute('data-active'));
});
```

## 3. 測試圓點點擊功能
```javascript
const dots = document.querySelectorAll('[data-testid="product-hero"] button[aria-label^="切換到圖片"]');
if (dots.length > 1) {
  console.log('Clicking second dot...');
  dots[1].click();
  
  // 等待一下然後檢查狀態
  setTimeout(() => {
    const container = document.querySelector('[data-testid="product-hero"] .flex.w-full.h-full');
    console.log('Transform after click:', container?.style.transform);
    
    dots.forEach((dot, index) => {
      console.log(`Dot ${index} active after click:`, dot.getAttribute('data-active'));
    });
  }, 500);
}
```

## 4. 切換到手機模式測試觸摸滑動
按 Ctrl+Shift+M (Windows) 或 Cmd+Shift+M (Mac) 切換到手機模擬模式，然後：

1. 選擇一個手機設備（如 iPhone 12 Pro）
2. 用滑鼠在圖片上從右向左拖拽，模擬手指滑動
3. 觀察圖片是否跟隨移動
4. 鬆開滑鼠，觀察是否切換到下一張圖片
5. 檢查圓點指示器是否正確更新

## 5. 監控調試輸出
在進行滑動操作時，注意控制台中的調試輸出：
- "設置位置:" - 顯示 transform 值變化
- "點擊圓點:" - 顯示圓點點擊事件
- "滑動中:" - 顯示滑動過程中的數據
- "圓點 X: 激活狀態" - 顯示圓點狀態變化

## 預期結果
- 圓點點擊應該立即切換圖片並更新 transform 值
- 觸摸滑動應該有跟隨效果，圖片跟隨手指移動
- 滑動結束後應該自動對齊到最近的圖片
- 圓點指示器應該正確反映當前圖片
- 調試輸出應該顯示正確的狀態變化