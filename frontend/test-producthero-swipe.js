// ProductHero 滑動測試腳本
// 在瀏覽器控制台中執行此腳本進行測試

(function testProductHeroSwipe() {
  console.log('🧪 開始 ProductHero 滑動測試...');
  
  // 查找 ProductHero 組件
  const heroSection = document.querySelector('[data-testid="product-hero"]');
  if (!heroSection) {
    console.error('❌ 找不到 ProductHero 組件');
    return;
  }
  
  // 查找滑動容器
  const slideContainer = heroSection.querySelector('.flex.w-full.h-full');
  if (!slideContainer) {
    console.error('❌ 找不到滑動容器');
    return;
  }
  
  // 查找圓點指示器
  const dots = heroSection.querySelectorAll('button[aria-label^="切換到圖片"]');
  console.log(`📊 找到 ${dots.length} 個圓點指示器`);
  
  // 查找圖片數量
  const images = slideContainer.querySelectorAll('img');
  console.log(`🖼️ 找到 ${images.length} 張圖片`);
  
  if (images.length < 2) {
    console.warn('⚠️ 圖片數量少於2張，無法測試滑動功能');
    return;
  }
  
  // 測試1: 檢查初始狀態
  console.log('🔍 測試1: 檢查初始狀態');
  const initialTransform = slideContainer.style.transform;
  console.log('初始 transform:', initialTransform);
  
  // 測試2: 點擊圓點測試
  console.log('🔍 測試2: 點擊圓點測試');
  if (dots.length > 1) {
    console.log('點擊第二個圓點...');
    dots[1].click();
    
    setTimeout(() => {
      const newTransform = slideContainer.style.transform;
      console.log('點擊後 transform:', newTransform);
      
      // 檢查激活狀態
      dots.forEach((dot, index) => {
        const isActive = dot.getAttribute('data-active') === 'true';
        console.log(`圓點 ${index}: 激活狀態 = ${isActive}`);
      });
    }, 500);
  }
  
  // 測試3: 模擬觸摸滑動
  console.log('🔍 測試3: 模擬觸摸滑動');
  
  function simulateTouch(element, type, clientX, clientY) {
    const touch = new Touch({
      identifier: 1,
      target: element,
      clientX: clientX,
      clientY: clientY,
      radiusX: 2.5,
      radiusY: 2.5,
      rotationAngle: 10,
      force: 0.5,
    });
    
    const touchEvent = new TouchEvent(type, {
      cancelable: true,
      bubbles: true,
      touches: type === 'touchend' ? [] : [touch],
      targetTouches: [],
      changedTouches: [touch],
      shiftKey: true,
    });
    
    element.dispatchEvent(touchEvent);
  }
  
  // 模擬從右向左滑動（切換到下一張）
  setTimeout(() => {
    console.log('模擬從右向左滑動...');
    const rect = slideContainer.getBoundingClientRect();
    const startX = rect.left + rect.width * 0.8;
    const endX = rect.left + rect.width * 0.2;
    const y = rect.top + rect.height * 0.5;
    
    // 記錄滑動前狀態
    const beforeTransform = slideContainer.style.transform;
    console.log('滑動前 transform:', beforeTransform);
    
    // 觸摸開始
    simulateTouch(slideContainer, 'touchstart', startX, y);
    
    // 觸摸移動
    setTimeout(() => {
      simulateTouch(slideContainer, 'touchmove', endX, y);
      
      // 觸摸結束
      setTimeout(() => {
        simulateTouch(slideContainer, 'touchend', endX, y);
        
        // 檢查滑動後狀態
        setTimeout(() => {
          const afterTransform = slideContainer.style.transform;
          console.log('滑動後 transform:', afterTransform);
          
          // 檢查圓點狀態
          dots.forEach((dot, index) => {
            const isActive = dot.getAttribute('data-active') === 'true';
            console.log(`滑動後圓點 ${index}: 激活狀態 = ${isActive}`);
          });
          
          console.log('✅ 滑動測試完成');
        }, 500);
      }, 100);
    }, 100);
  }, 1000);
  
  // 測試4: 監聽調試輸出
  console.log('🔍 測試4: 監聽調試輸出（已在組件中添加）');
  console.log('請查看控制台中以 "設置位置:", "點擊圓點:", "滑動中:", "圓點 X: 激活狀態" 開頭的調試信息');
  
})();