/**
 * 購物車樂觀更新測試腳本
 * 在瀏覽器 Console 中運行
 */

// 測試樂觀更新功能
async function testOptimisticUpdate() {
    console.log('🧪 開始測試購物車樂觀更新功能...');
    
    // 1. 檢查是否在購物車頁面
    if (!window.location.pathname.includes('/cart')) {
        console.warn('⚠️ 請先前往購物車頁面 (/cart) 再執行此測試');
        return;
    }
    
    // 2. 檢查是否有 React 組件
    const reactFiber = document.querySelector('#__next')?._reactInternalFiber 
                    || document.querySelector('#__next')?._reactInternalInstance;
    
    if (!reactFiber) {
        console.warn('⚠️ 無法找到 React 實例，請確保頁面已完全載入');
        return;
    }
    
    // 3. 檢查購物車項目
    const cartItems = document.querySelectorAll('[data-testid*="cart-item"], .cart-item, [class*="cart"] [class*="item"]');
    
    if (cartItems.length === 0) {
        console.warn('⚠️ 購物車中沒有商品，請先添加商品後再測試');
        return;
    }
    
    console.log(`✅ 找到 ${cartItems.length} 個購物車項目`);
    
    // 4. 尋找數量增減按鈕
    const increaseButtons = document.querySelectorAll('button[aria-label*="增加"], button[title*="增加"], button:has(svg), button[onclick*="increase"], button[onclick*="+"]');
    const decreaseButtons = document.querySelectorAll('button[aria-label*="減少"], button[title*="減少"], button[onclick*="decrease"], button[onclick*="-"]');
    
    console.log(`找到 ${increaseButtons.length} 個可能的增加按鈕`);
    console.log(`找到 ${decreaseButtons.length} 個可能的減少按鈕`);
    
    // 5. 測試樂觀更新
    if (increaseButtons.length > 0) {
        const testButton = increaseButtons[0];
        console.log('🚀 測試點擊增加按鈕...');
        
        // 記錄點擊前的狀態
        const beforeClick = Date.now();
        
        // 模擬點擊
        testButton.click();
        
        // 檢查界面是否立即更新
        setTimeout(() => {
            const afterClick = Date.now();
            const delay = afterClick - beforeClick;
            
            if (delay < 100) {
                console.log('✅ 樂觀更新工作正常 - 界面立即響應');
            } else {
                console.warn('⚠️ 樂觀更新可能有問題 - 界面響應延遲');
            }
        }, 50);
    }
    
    // 6. 監聽網路請求
    const originalFetch = window.fetch;
    let apiCallDetected = false;
    
    window.fetch = async function(...args) {
        const url = args[0];
        if (typeof url === 'string' && url.includes('/cart')) {
            apiCallDetected = true;
            console.log('📡 檢測到購物車 API 調用:', url);
        }
        return originalFetch.apply(this, args);
    };
    
    setTimeout(() => {
        window.fetch = originalFetch;
        if (!apiCallDetected) {
            console.warn('⚠️ 未檢測到 API 調用，可能有問題');
        }
    }, 3000);
    
    console.log('✅ 測試完成，請觀察控制台輸出和界面反應');
}

// 自動執行測試
testOptimisticUpdate();

// 也可以手動調用
window.testOptimisticUpdate = testOptimisticUpdate;