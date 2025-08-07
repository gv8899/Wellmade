const { chromium } = require('playwright');

async function testAuthDebug() {
  console.log('🔍 開始認證調試測試...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 2000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 監聽所有 console 日誌
  page.on('console', msg => {
    if (msg.text().includes('NextAuth') || msg.text().includes('session') || msg.text().includes('token')) {
      console.log(`📝 Console: ${msg.text()}`);
    }
  });
  
  // 監聽網路請求
  page.on('response', response => {
    if (response.url().includes('/auth') || response.url().includes('/api/auth')) {
      console.log(`🌐 ${response.request().method()} ${response.url()} - ${response.status()}`);
    }
  });
  
  try {
    // 1. 訪問首頁
    console.log('📍 步驟 1: 訪問首頁');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 2. 檢查未登入狀態的 session
    console.log('📍 步驟 2: 檢查未登入狀態');
    const unauthedSession = await page.evaluate(() => {
      return fetch('/api/auth/session').then(r => r.json());
    });
    console.log('🔍 未登入 session:', unauthedSession);
    
    // 3. 點擊登入
    console.log('📍 步驟 3: 嘗試登入');
    try {
      const loginButton = await page.$('button:has-text("登入")');
      if (loginButton) {
        await loginButton.click();
        await page.waitForTimeout(3000);
        
        // 如果跳轉到 Google 登入頁面，就等待用戶手動登入
        const currentUrl = page.url();
        if (currentUrl.includes('accounts.google.com')) {
          console.log('🔄 已跳轉到 Google 登入頁面，請手動完成登入...');
          
          // 等待用戶完成登入並回到我們的網站
          await page.waitForFunction(() => {
            return !window.location.href.includes('accounts.google.com');
          }, { timeout: 300000 }); // 5 分鐘超時
          
          console.log('✅ 登入完成，當前 URL:', page.url());
          await page.waitForTimeout(5000); // 等待 callback 處理完成
        }
      }
    } catch (e) {
      console.log('⚠️  無法自動點擊登入，請手動登入');
    }
    
    // 4. 檢查登入後的 session
    console.log('📍 步驟 4: 檢查登入後的 session');
    await page.waitForTimeout(3000);
    
    const authedSession = await page.evaluate(() => {
      return fetch('/api/auth/session').then(r => r.json());
    });
    console.log('🔍 登入後 session:', JSON.stringify(authedSession, null, 2));
    
    // 5. 檢查 session 中的關鍵欄位
    console.log('📍 步驟 5: 分析 session 內容');
    if (authedSession) {
      console.log('🔑 Session 分析:');
      console.log('- 有 user:', !!authedSession.user);
      console.log('- 有 email:', !!authedSession.user?.email);
      console.log('- 有 userId:', !!authedSession.userId);
      console.log('- 有 backendToken:', !!authedSession.backendToken);
      console.log('- 有 roles:', !!authedSession.roles);
      console.log('- Provider:', authedSession.provider);
      
      if (authedSession.backendToken) {
        console.log('✅ backendToken 存在，長度:', authedSession.backendToken.length);
      } else {
        console.log('❌ backendToken 不存在！這是問題的根源。');
      }
    }
    
    // 6. 直接測試後端 OAuth 同步端點
    console.log('📍 步驟 6: 測試後端 OAuth 同步');
    if (authedSession?.user?.email) {
      const oauthSyncTest = await page.evaluate(async (email, name, image) => {
        try {
          const response = await fetch('http://localhost:3003/auth/oauth-sync', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              name: name || 'Test User',
              picture: image || '',
              provider: 'google'
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
      }, authedSession.user.email, authedSession.user.name, authedSession.user.image);
      
      console.log('🔧 OAuth 同步測試結果:', JSON.stringify(oauthSyncTest, null, 2));
    }
    
    // 7. 測試購物車 API 認證
    console.log('📍 步驟 7: 測試購物車 API 認證');
    const cartTest = await page.evaluate(async () => {
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
    
    console.log('🛒 購物車 API 測試結果:', JSON.stringify(cartTest, null, 2));
    
    console.log('⏳ 保持瀏覽器開啟 60 秒供進一步檢查...');
    await page.waitForTimeout(60000);
    
  } catch (error) {
    console.error('❌ 測試錯誤:', error);
  } finally {
    await browser.close();
  }
}

testAuthDebug().catch(console.error);