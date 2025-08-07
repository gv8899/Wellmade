// 自動化測試 ProductHero 滑動功能
const puppeteer = require('puppeteer');

async function testProductHeroSwipe() {
  console.log('🚀 啟動自動化測試...');
  
  const browser = await puppeteer.launch({ 
    headless: false, 
    devtools: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  // 設置手機視窗大小
  await page.setViewport({ width: 375, height: 667 });
  
  try {
    // 導航到產品頁面
    console.log('📱 導航到產品頁面...');
    await page.goto('http://localhost:3000/product/57d995b3-3511-4db4-86a7-a8c773a45f7c', {
      waitUntil: 'networkidle0'
    });
    
    // 等待 ProductHero 載入
    await page.waitForSelector('[data-testid="product-hero"]', { timeout: 10000 });
    console.log('✅ ProductHero 組件已載入');
    
    // 檢查組件基本元素
    const heroExists = await page.$('[data-testid="product-hero"]') !== null;
    const containerExists = await page.$('[data-testid="product-hero"] .flex.w-full.h-full') !== null;
    const images = await page.$$('[data-testid="product-hero"] img');
    const dots = await page.$$('[data-testid="product-hero"] button[aria-label^="切換到圖片"]');
    
    console.log(`📊 檢查結果:
    - Hero 組件: ${heroExists ? '✅' : '❌'}
    - 滑動容器: ${containerExists ? '✅' : '❌'}
    - 圖片數量: ${images.length}
    - 圓點數量: ${dots.length}`);
    
    if (images.length < 2) {
      console.warn('⚠️ 圖片數量不足，無法測試滑動功能');
      return;
    }
    
    // 啟用控制台日誌監聽
    page.on('console', msg => {
      const text = msg.text();
      if (text.includes('設置位置:') || 
          text.includes('點擊圓點:') || 
          text.includes('滑動中:') || 
          text.includes('圓點') && text.includes('激活狀態')) {
        console.log('🔍 控制台調試:', text);
      }
    });
    
    // 測試1: 檢查初始狀態
    console.log('\n🔍 測試1: 檢查初始狀態');
    const initialTransform = await page.evaluate(() => {
      const container = document.querySelector('[data-testid="product-hero"] .flex.w-full.h-full');
      return container?.style.transform || 'none';
    });
    console.log('初始 transform:', initialTransform);
    
    // 測試2: 點擊圓點測試
    if (dots.length > 1) {
      console.log('\n🔍 測試2: 點擊第二個圓點');
      await page.click('[data-testid="product-hero"] button[aria-label^="切換到圖片"]:nth-child(2)');
      
      // 等待動畫完成
      await page.waitForTimeout(500);
      
      const afterClickTransform = await page.evaluate(() => {
        const container = document.querySelector('[data-testid="product-hero"] .flex.w-full.h-full');
        return container?.style.transform || 'none';
      });
      
      const dotStates = await page.evaluate(() => {
        const dots = document.querySelectorAll('[data-testid="product-hero"] button[aria-label^="切換到圖片"]');
        return Array.from(dots).map((dot, index) => ({
          index,
          active: dot.getAttribute('data-active') === 'true'
        }));
      });
      
      console.log('點擊後 transform:', afterClickTransform);
      console.log('圓點狀態:', dotStates);
    }
    
    // 測試3: 觸摸滑動測試
    console.log('\n🔍 測試3: 模擬觸摸滑動');
    
    const containerSelector = '[data-testid="product-hero"] .flex.w-full.h-full';
    const containerBounds = await page.evaluate((selector) => {
      const element = document.querySelector(selector);
      const rect = element.getBoundingClientRect();
      return {
        x: rect.left,
        y: rect.top,
        width: rect.width,
        height: rect.height
      };
    }, containerSelector);
    
    // 從右向左滑動
    const startX = containerBounds.x + containerBounds.width * 0.8;
    const endX = containerBounds.x + containerBounds.width * 0.2;
    const y = containerBounds.y + containerBounds.height * 0.5;
    
    console.log(`滑動軌跡: (${startX}, ${y}) → (${endX}, ${y})`);
    
    // 記錄滑動前狀態
    const beforeSwipeTransform = await page.evaluate(() => {
      const container = document.querySelector('[data-testid="product-hero"] .flex.w-full.h-full');
      return container?.style.transform || 'none';
    });
    console.log('滑動前 transform:', beforeSwipeTransform);
    
    // 執行觸摸滑動
    await page.touchscreen.tap(startX, y);
    await page.mouse.move(startX, y);
    await page.mouse.down();
    await page.mouse.move(endX, y, { steps: 10 });
    await page.mouse.up();
    
    // 等待動畫完成
    await page.waitForTimeout(1000);
    
    const afterSwipeTransform = await page.evaluate(() => {
      const container = document.querySelector('[data-testid="product-hero"] .flex.w-full.h-full');
      return container?.style.transform || 'none';
    });
    
    const finalDotStates = await page.evaluate(() => {
      const dots = document.querySelectorAll('[data-testid="product-hero"] button[aria-label^="切換到圖片"]');
      return Array.from(dots).map((dot, index) => ({
        index,
        active: dot.getAttribute('data-active') === 'true'
      }));
    });
    
    console.log('滑動後 transform:', afterSwipeTransform);
    console.log('最終圓點狀態:', finalDotStates);
    
    // 測試結果分析
    console.log('\n📊 測試結果分析:');
    console.log('- 圓點點擊功能:', initialTransform !== afterClickTransform ? '✅ 正常' : '❌ 異常');
    console.log('- 觸摸滑動功能:', beforeSwipeTransform !== afterSwipeTransform ? '✅ 正常' : '❌ 異常');
    console.log('- 圓點狀態同步:', finalDotStates.some(dot => dot.active) ? '✅ 正常' : '❌ 異常');
    
    console.log('\n✅ 測試完成！請檢查控制台調試輸出和視覺效果。');
    
    // 保持瀏覽器開啟以便手動檢查
    console.log('瀏覽器保持開啟，請手動進行進一步測試...');
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  }
  
  // 不自動關閉瀏覽器，方便手動檢查
  // await browser.close();
}

// 檢查是否在 Node.js 環境中執行
if (typeof require !== 'undefined' && require.main === module) {
  testProductHeroSwipe().catch(console.error);
} else {
  console.log('請在 Node.js 環境中執行此腳本：node automated-test.js');
}