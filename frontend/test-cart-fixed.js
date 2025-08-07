const { chromium } = require('playwright');

async function testCartAfterPortFix() {
  let browser, page;
  
  try {
    browser = await chromium.launch({ 
      headless: false,
      slowMo: 1000 
    });
    
    const context = await browser.newContext();
    page = await context.newPage();
    
    // 啟用詳細日誌
    page.on('console', msg => {
      if (msg.text().includes('CART') || msg.text().includes('購物車') || msg.text().includes('商品')) {
        console.log(`🔍 [Browser Console]: ${msg.text()}`);
      }
    });
    
    console.log('⏳ 開始測試修復後的購物車功能...');
    
    // 1. 訪問首頁 (現在應該在 port 3000)
    console.log('1. 訪問首頁...');
    await page.goto('http://localhost:3000');
    await page.waitForLoadState('networkidle');
    
    // 2. 等待 Google 登入按鈕出現並點擊
    console.log('2. 進行 Google 登入...');
    const loginButton = await page.locator('text=使用 Google 登入').first();
    await loginButton.click();
    
    // 等待 Google OAuth 頁面
    await page.waitForURL(/accounts\.google\.com/, { timeout: 10000 });
    console.log('✅ Google OAuth 頁面已載入');
    
    // 模擬登入完成 - 等待重定向回首頁
    console.log('⏳ 等待 OAuth 完成...');
    await page.waitForURL('http://localhost:3000/', { timeout: 30000 });
    
    // 3. 驗證登入狀態
    console.log('3. 驗證登入狀態...');
    await page.waitForSelector('text=登出', { timeout: 10000 });
    console.log('✅ 用戶已成功登入');
    
    // 4. 導航到商品頁面
    console.log('4. 導航到商品頁面...');
    await page.goto('http://localhost:3000/products');
    await page.waitForLoadState('networkidle');
    
    // 5. 選擇第一個商品
    console.log('5. 選擇商品...');
    const firstProduct = await page.locator('.product-card').first();
    await firstProduct.click();
    await page.waitForLoadState('networkidle');
    
    // 6. 添加商品到購物車
    console.log('6. 添加商品到購物車...');
    const addToCartButton = await page.locator('text=加入購物車').first();
    await addToCartButton.click();
    
    // 等待 API 請求完成
    await page.waitForTimeout(2000);
    
    // 7. 檢查購物車圖標更新
    console.log('7. 檢查購物車狀態...');
    const cartBadge = await page.locator('[data-testid="cart-badge"]');
    const cartCount = await cartBadge.textContent();
    console.log(`🛒 購物車顯示商品數量: ${cartCount}`);
    
    // 8. 訪問購物車頁面
    console.log('8. 訪問購物車頁面...');
    await page.goto('http://localhost:3000/cart');
    await page.waitForLoadState('networkidle');
    
    // 9. 檢查購物車內容
    console.log('9. 檢查購物車內容...');
    
    // 等待購物車內容載入
    await page.waitForTimeout(3000);
    
    // 檢查是否顯示 "0 件商品"
    const emptyCartText = await page.locator('text=0 件商品').count();
    const cartItems = await page.locator('.cart-item').count();
    
    console.log(`📊 測試結果:`);
    console.log(`- 是否顯示 "0 件商品": ${emptyCartText > 0 ? '是' : '否'}`);
    console.log(`- 實際購物車項目數量: ${cartItems}`);
    
    if (emptyCartText === 0 && cartItems > 0) {
      console.log('✅ 購物車功能正常！修復成功！');
      return true;
    } else {
      console.log('❌ 購物車仍然顯示為空');
      return false;
    }
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error.message);
    return false;
  } finally {
    if (page) await page.close();
    if (browser) await browser.close();
  }
}

// 執行測試
testCartAfterPortFix().then(success => {
  if (success) {
    console.log('\n🎉 修復驗證成功！購物車功能已恢復正常。');
    process.exit(0);
  } else {
    console.log('\n⚠️  需要進一步診斷，問題可能不僅僅是端口問題。');
    process.exit(1);
  }
}).catch(error => {
  console.error('測試執行失敗:', error);
  process.exit(1);
});