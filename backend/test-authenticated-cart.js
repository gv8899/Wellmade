const { chromium } = require('playwright');
const { Client } = require('pg');

const dbConfig = {
  host: '127.0.0.1',
  port: 5432,
  user: 'wellmade_user',
  password: 'wellmade_password',
  database: 'wellmade'
};

async function testAuthenticatedCart() {
  console.log('🔐 開始認證購物車測試...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1500 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 監聽所有購物車相關的網路請求
  page.on('response', response => {
    if (response.url().includes('/cart') || response.url().includes('/api/cart')) {
      console.log(`🌐 ${response.request().method()} ${response.url()} - ${response.status()}`);
    }
  });
  
  // 監聽 console 日誌
  page.on('console', msg => {
    if (msg.text().includes('CART') || msg.text().includes('cart') || msg.text().includes('購物車')) {
      console.log(`📝 Console: ${msg.text()}`);
    }
  });
  
  try {
    // 1. 先以訪客身份加入商品到購物車
    console.log('📍 步驟 1: 訪客模式加入商品');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 直接調用 API 加入商品
    const addItemResponse = await page.evaluate(async () => {
      const response = await fetch('/api/cart/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productId: '3c0e65bb-27f5-4857-afe3-c6d987fb6fb5',
          quantity: 2,
          specs: {}
        })
      });
      return await response.json();
    });
    
    console.log('✅ 訪客模式加入商品結果:', addItemResponse.items?.length || 0, '項商品');
    
    // 2. 檢查購物車頁面（訪客狀態）
    console.log('📍 步驟 2: 檢查訪客購物車頁面');
    await page.goto('http://localhost:3000/cart');
    await page.waitForTimeout(5000);
    
    let cartContent = await page.textContent('body');
    console.log('🛒 訪客購物車狀態:');
    console.log('- 包含 "0 件商品":', cartContent.includes('0 件商品'));
    console.log('- 包含 "2 件商品":', cartContent.includes('2 件商品'));
    console.log('- 包含 "載入中":', cartContent.includes('載入中'));
    
    // 3. 嘗試登入 Google（模擬）
    console.log('📍 步驟 3: 模擬登入過程');
    
    // 點擊登入按鈕或連結
    const loginSelectors = [
      'button:has-text("登入")',
      'a:has-text("登入")',
      'button:has-text("Login")',
      '[data-testid="login"]',
      'button[class*="login"]'
    ];
    
    let found = false;
    for (const selector of loginSelectors) {
      try {
        const loginElement = await page.$(selector);
        if (loginElement) {
          console.log(`✅ 找到登入按鈕: ${selector}`);
          await loginElement.click();
          found = true;
          break;
        }
      } catch (e) {
        // 繼續嘗試
      }
    }
    
    if (!found) {
      console.log('⚠️  未找到登入按鈕，直接訪問認證端點');
      // 直接跳轉到 Google OAuth
      await page.goto('http://localhost:3000/api/auth/signin/google');
      await page.waitForTimeout(3000);
    }
    
    // 4. 等待可能的重定向並檢查認證狀態
    console.log('📍 步驟 4: 檢查認證狀態');
    await page.waitForTimeout(5000);
    
    // 檢查是否有 session 或認證標誌
    const authStatus = await page.evaluate(() => {
      // 檢查 localStorage 或其他認證標誌
      return {
        hasLocalStorage: Object.keys(localStorage).length > 0,
        hasSessionStorage: Object.keys(sessionStorage).length > 0,
        currentUrl: window.location.href,
        cookies: document.cookie
      };
    });
    
    console.log('🔍 認證狀態檢查:', authStatus);
    
    // 5. 回到購物車頁面檢查修復機制
    console.log('📍 步驟 5: 檢查購物車綁定修復');
    await page.goto('http://localhost:3000/cart');
    await page.waitForTimeout(8000); // 給修復機制更多時間
    
    cartContent = await page.textContent('body');
    console.log('🛒 登入後購物車狀態:');
    console.log('- 包含 "0 件商品":', cartContent.includes('0 件商品'));
    console.log('- 包含 "2 件商品":', cartContent.includes('2 件商品'));
    console.log('- 包含 "載入中":', cartContent.includes('載入中'));
    console.log('- 包含 "修復":', cartContent.includes('修復'));
    
    // 6. 測試 force-bind API
    console.log('📍 步驟 6: 直接測試 force-bind API');
    const forceBindResponse = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/cart/force-bind', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
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
    
    console.log('🔧 Force-bind API 測試結果:', forceBindResponse);
    
    // 再次檢查購物車
    await page.reload();
    await page.waitForTimeout(5000);
    
    cartContent = await page.textContent('body');
    console.log('🛒 Force-bind 後購物車狀態:');
    console.log('- 包含 "0 件商品":', cartContent.includes('0 件商品'));
    console.log('- 包含 "2 件商品":', cartContent.includes('2 件商品'));
    
  } catch (error) {
    console.error('❌ 測試錯誤:', error);
  } finally {
    // 不要立即關閉瀏覽器，讓用戶可以手動檢查
    console.log('⏳ 保持瀏覽器開啟 30 秒供手動檢查...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
  
  // 最終檢查資料庫
  await checkFinalDatabaseState();
}

async function checkFinalDatabaseState() {
  console.log('📍 最終資料庫狀態檢查');
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    
    // 檢查最近 5 分鐘的購物車
    const recentCarts = await client.query(`
      SELECT c.id, c."userId", c."sessionId", c."createdAt",
             COUNT(ci.id) as item_count
      FROM carts c
      LEFT JOIN cart_items ci ON c.id = ci."cartId"
      WHERE c."createdAt" > NOW() - INTERVAL '5 minutes'
      GROUP BY c.id, c."userId", c."sessionId", c."createdAt"
      ORDER BY c."createdAt" DESC
    `);
    
    console.log('📊 最近 5 分鐘的購物車統計:');
    recentCarts.rows.forEach(cart => {
      console.log(`   Cart: ${cart.id.substring(0, 8)}... | User: ${cart.userId || 'guest'} | Items: ${cart.item_count}`);
    });
    
  } catch (error) {
    console.error('❌ 資料庫檢查錯誤:', error);
  } finally {
    await client.end();
  }
}

testAuthenticatedCart().catch(console.error);