const { chromium } = require('playwright');

async function testCompleteFlow() {
  console.log('🚀 開始完整的認證和購物車流程測試...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 監聽所有 console 日誌
  page.on('console', msg => {
    if (msg.text().includes('🔥') || msg.text().includes('NextAuth') || msg.text().includes('CART')) {
      console.log(`📝 Console: ${msg.text()}`);
    }
  });
  
  // 監聽網路請求
  page.on('response', response => {
    if (response.url().includes('/auth') || response.url().includes('/cart')) {
      console.log(`🌐 ${response.request().method()} ${response.url()} - ${response.status()}`);
    }
  });
  
  try {
    // 1. 訪問測試頁面
    console.log('📍 步驟 1: 訪問認證測試頁面');
    await page.goto('http://localhost:3000/test-auth');
    await page.waitForTimeout(5000);
    
    // 2. 檢查初始狀態
    console.log('📍 步驟 2: 檢查初始 NextAuth 狀態');
    const initialStatus = await page.textContent('p:has-text("Status:")');
    console.log('🔍 初始狀態:', initialStatus);
    
    // 3. 測試 session 端點
    console.log('📍 步驟 3: 測試 session');
    await page.click('button:has-text("測試 Session")');
    await page.waitForTimeout(3000);
    
    // 4. 檢查後端 OAuth 同步
    console.log('📍 步驟 4: 測試後端 OAuth 同步');
    await page.click('button:has-text("測試後端同步")');
    await page.waitForTimeout(3000);
    
    // 5. 嘗試 Google 登入
    console.log('📍 步驟 5: 嘗試 Google 登入');
    await page.click('button:has-text("Google 登入")');
    await page.waitForTimeout(3000);
    
    // 檢查是否跳轉到 Google
    const currentUrl = page.url();
    console.log('🔍 當前 URL:', currentUrl);
    
    if (currentUrl.includes('accounts.google.com')) {
      console.log('✅ 成功跳轉到 Google OAuth');
      console.log('⏳ 請手動完成 Google 登入，然後等待回調...');
      
      // 等待回到我們的網站
      await page.waitForFunction(() => {
        return !window.location.href.includes('accounts.google.com');
      }, { timeout: 300000 }); // 5 分鐘
      
      console.log('🔄 已回到網站:', page.url());
      await page.waitForTimeout(5000); // 等待 NextAuth 處理回調
      
      // 6. 檢查登入後的狀態
      console.log('📍 步驟 6: 檢查登入後狀態');
      await page.reload();
      await page.waitForTimeout(5000);
      
      const loggedInStatus = await page.textContent('p:has-text("Status:")');
      const hasBackendToken = await page.textContent('p:has-text("有 backendToken:")');
      const userEmail = await page.textContent('p:has-text("用戶:")');
      
      console.log('🔍 登入後狀態:');
      console.log('- 狀態:', loggedInStatus);
      console.log('- Backend Token:', hasBackendToken);
      console.log('- 用戶:', userEmail);
      
      // 7. 測試購物車綁定
      console.log('📍 步驟 7: 測試購物車綁定');
      await page.click('button:has-text("測試購物車綁定")');
      await page.waitForTimeout(3000);
      
      // 8. 測試加入商品到購物車
      console.log('📍 步驟 8: 測試加入商品到購物車');
      const addItemResult = await page.evaluate(async () => {
        try {
          const response = await fetch('/api/cart/items', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              productId: '3c0e65bb-27f5-4857-afe3-c6d987fb6fb5',
              quantity: 1,
              specs: {}
            })
          });
          return {
            status: response.status,
            ok: response.ok,
            data: response.ok ? await response.json() : await response.text()
          };
        } catch (error) {
          return { error: error.message };
        }
      });
      
      console.log('🛒 加入商品結果:', JSON.stringify(addItemResult, null, 2));
      
      // 9. 檢查購物車頁面
      console.log('📍 步驟 9: 檢查購物車頁面');
      await page.goto('http://localhost:3000/cart');
      await page.waitForTimeout(8000); // 給修復機制時間
      
      const cartContent = await page.textContent('body');
      console.log('🛒 購物車頁面檢查:');
      console.log('- 包含 "0 件商品":', cartContent.includes('0 件商品'));
      console.log('- 包含 "1 件商品":', cartContent.includes('1 件商品'));
      console.log('- 包含 "載入中":', cartContent.includes('載入中'));
    }
    
    console.log('⏳ 保持瀏覽器開啟 30 秒供檢查...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ 測試錯誤:', error);
  } finally {
    await browser.close();
  }
}

testCompleteFlow().catch(console.error);