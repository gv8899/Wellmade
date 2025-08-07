// 測試 NextAuth 配置
const { chromium } = require('playwright');

async function testNextAuthConfig() {
  console.log('🔧 測試 NextAuth 配置...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 監聽所有網路請求
  page.on('response', response => {
    console.log(`🌐 ${response.request().method()} ${response.url()} - ${response.status()}`);
  });
  
  // 監聽錯誤
  page.on('pageerror', error => {
    console.log('❌ 頁面錯誤:', error.message);
  });
  
  try {
    // 1. 測試 NextAuth 配置端點
    console.log('📍 步驟 1: 測試 NextAuth 提供者配置');
    await page.goto('http://localhost:3000/api/auth/providers');
    await page.waitForTimeout(2000);
    
    const providersText = await page.textContent('body');
    console.log('🔍 提供者配置:', providersText);
    
    // 2. 測試 session 端點
    console.log('📍 步驟 2: 測試 session 端點');
    await page.goto('http://localhost:3000/api/auth/session');
    await page.waitForTimeout(2000);
    
    const sessionText = await page.textContent('body');
    console.log('🔍 Session 回應:', sessionText);
    
    // 3. 測試 Google OAuth 流程開始
    console.log('📍 步驟 3: 測試 Google OAuth 流程');
    await page.goto('http://localhost:3000/api/auth/signin/google');
    await page.waitForTimeout(3000);
    
    const currentUrl = page.url();
    console.log('🔍 OAuth 重定向 URL:', currentUrl);
    
    if (currentUrl.includes('accounts.google.com')) {
      console.log('✅ 成功重定向到 Google OAuth');
      
      // 檢查 callback URL 配置
      const callbackUrlMatch = currentUrl.match(/redirect_uri=([^&]+)/);
      if (callbackUrlMatch) {
        const callbackUrl = decodeURIComponent(callbackUrlMatch[1]);
        console.log('🔄 Callback URL:', callbackUrl);
        
        if (callbackUrl === 'http://localhost:3000/api/auth/callback/google') {
          console.log('✅ Callback URL 配置正確');
        } else {
          console.log('❌ Callback URL 配置錯誤');
        }
      }
    } else {
      console.log('❌ 未重定向到 Google OAuth，可能配置有問題');
    }
    
    // 4. 回到首頁並檢查 NextAuth.js 是否正常載入
    console.log('📍 步驟 4: 檢查首頁 NextAuth 狀態');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(3000);
    
    // 檢查是否有相關的 NextAuth JavaScript
    const hasNextAuth = await page.evaluate(() => {
      return {
        hasNextAuthScript: !!document.querySelector('script[src*="next-auth"]'),
        hasAuthProviders: typeof window !== 'undefined' && 'next-auth' in window,
        cookies: document.cookie,
        localStorage: Object.keys(localStorage),
        sessionStorage: Object.keys(sessionStorage)
      };
    });
    
    console.log('🔍 NextAuth 前端狀態:', JSON.stringify(hasNextAuth, null, 2));
    
    // 5. 測試手動觸發 signIn
    console.log('📍 步驟 5: 測試手動觸發 signIn');
    const signInTest = await page.evaluate(async () => {
      try {
        // 嘗試使用 next-auth/react
        const response = await fetch('/api/auth/signin/google', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ callbackUrl: 'http://localhost:3000' })
        });
        
        return {
          status: response.status,
          ok: response.ok,
          url: response.url,
          headers: Array.from(response.headers.entries())
        };
        
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('🔧 手動 signIn 測試:', JSON.stringify(signInTest, null, 2));
    
  } catch (error) {
    console.error('❌ 配置測試錯誤:', error);
  } finally {
    console.log('⏳ 保持瀏覽器開啟 30 秒...');
    await page.waitForTimeout(30000);
    await browser.close();
  }
}

testNextAuthConfig().catch(console.error);