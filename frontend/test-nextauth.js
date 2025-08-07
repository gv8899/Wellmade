// 測試 NextAuth 配置
const { chromium } = require('playwright');

async function testNextAuth() {
  console.log('🔧 測試 NextAuth 配置...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 測試提供者
    console.log('📍 測試 NextAuth 提供者');
    await page.goto('http://localhost:3000/api/auth/providers');
    await page.waitForTimeout(2000);
    
    const providersText = await page.textContent('body');
    console.log('🔍 提供者:', providersText);
    
    // 2. 測試 Google OAuth 開始
    console.log('📍 測試 Google OAuth');
    await page.goto('http://localhost:3000/api/auth/signin/google');
    await page.waitForTimeout(3000);
    
    console.log('🔍 當前 URL:', page.url());
    
    if (page.url().includes('accounts.google.com')) {
      console.log('✅ 成功重定向到 Google');
    } else {
      console.log('❌ Google OAuth 配置可能有問題');
    }
    
  } catch (error) {
    console.error('❌ 錯誤:', error);
  } finally {
    console.log('⏳ 保持開啟 20 秒...');
    await page.waitForTimeout(20000);
    await browser.close();
  }
}

testNextAuth().catch(console.error);