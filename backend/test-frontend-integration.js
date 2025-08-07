// 測試前後端整合
const { chromium } = require('playwright');

async function testFrontendIntegration() {
  console.log('🚀 開始前後端整合測試...');
  
  const browser = await chromium.launch({ 
    headless: false,
    slowMo: 1000 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // 監聽 console 日誌
  page.on('console', msg => {
    if (msg.text().includes('購物車') || msg.text().includes('CART') || msg.text().includes('cart')) {
      console.log(`📝 Frontend Console: ${msg.text()}`);
    }
  });
  
  // 監聽網路請求
  page.on('response', response => {
    if (response.url().includes('/api/cart') || response.url().includes('/cart')) {
      console.log(`🌐 ${response.request().method()} ${response.url()} - ${response.status()}`);
    }
  });
  
  try {
    // 1. 先直接訪問購物車頁面（應該是訪客模式）
    console.log('📍 步驟 1: 訪問購物車頁面（訪客模式）');
    await page.goto('http://localhost:3000/cart');
    await page.waitForTimeout(5000);
    
    // 檢查頁面內容
    const pageContent = await page.textContent('body');
    console.log('🔍 購物車頁面內容包含「0 件商品」:', pageContent.includes('0 件商品'));
    console.log('🔍 購物車頁面內容包含「載入中」:', pageContent.includes('載入中'));
    
    // 2. 測試 API 調用
    console.log('📍 步驟 2: 在瀏覽器中測試購物車 API');
    const apiResult = await page.evaluate(async () => {
      try {
        const response = await fetch('/api/cart');
        const data = await response.json();
        return {
          status: response.status,
          itemCount: data.items?.length || 0,
          hasItems: (data.items?.length || 0) > 0
        };
      } catch (error) {
        return { error: error.message };
      }
    });
    
    console.log('🔍 瀏覽器 API 測試結果:', apiResult);
    
    // 3. 訪問認證測試頁面
    console.log('📍 步驟 3: 訪問認証測試頁面');
    await page.goto('http://localhost:3000/test-auth');
    await page.waitForTimeout(3000);
    
    // 檢查認證狀態
    const authStatus = await page.textContent('p:has-text("Status:")').catch(() => 'Not found');
    console.log('🔍 認証狀態:', authStatus);
    
    console.log('⏳ 保持瀏覽器開啟 30 秒供檢查...');
    await page.waitForTimeout(30000);
    
  } catch (error) {
    console.error('❌ 測試錯誤:', error);
  } finally {
    await browser.close();
  }
}

testFrontendIntegration().catch(console.error);