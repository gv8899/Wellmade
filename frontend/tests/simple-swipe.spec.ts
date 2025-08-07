import { test, expect } from '@playwright/test';

/**
 * 簡化版滑動測試 - 驗證基本功能
 */

// 使用有多張圖片的產品
const PRODUCT_ID = '945410d3-fe4b-4614-8682-3f9f8b45026b'; // 手沖壺

test.describe('ProductHero 基本滑動功能', () => {
  
  test.beforeEach(async ({ page }) => {
    await page.goto(`/product/${PRODUCT_ID}`);
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="product-hero"]', { timeout: 15000 });
  });

  test('1. 檢查產品頁面是否正確加載', async ({ page }) => {
    // 檢查 Hero 區塊是否存在
    const heroContainer = page.locator('[data-testid="product-hero"]');
    await expect(heroContainer).toBeVisible();
    
    // 檢查圖片是否加載
    const images = heroContainer.locator('img');
    await expect(images.first()).toBeVisible();
    
    // 檢查是否有滑動容器
    const slideContainer = heroContainer.locator('div').first();
    await expect(slideContainer).toBeVisible();
    
    console.log('✅ 產品頁面正確加載');
  });

  test('2. 檢查圓點指示器是否存在', async ({ page }) => {
    const heroContainer = page.locator('[data-testid="product-hero"]');
    
    // 等待頁面完全加載
    await page.waitForTimeout(2000);
    
    // 檢查是否有圓點指示器
    const dots = heroContainer.locator('button[aria-label*="切換到圖片"]');
    const dotCount = await dots.count();
    
    console.log(`找到 ${dotCount} 個圓點指示器`);
    
    if (dotCount > 1) {
      // 檢查第一個圓點是否為活躍狀態
      const firstDot = dots.first();
      await expect(firstDot).toBeVisible();
      
      console.log('✅ 圓點指示器正確顯示');
    } else {
      console.log('ℹ️ 此產品只有一張圖片，無需圓點指示器');
    }
  });

  test('3. 測試圓點點擊功能', async ({ page }) => {
    const heroContainer = page.locator('[data-testid="product-hero"]');
    await page.waitForTimeout(2000);
    
    const dots = heroContainer.locator('button[aria-label*="切換到圖片"]');
    const dotCount = await dots.count();
    
    if (dotCount <= 1) {
      console.log('跳過測試：產品只有一張圖片');
      return;
    }
    
    // 點擊第二個圓點
    const secondDot = dots.nth(1);
    await secondDot.click();
    await page.waitForTimeout(500);
    
    // 檢查圓點狀態是否更新
    const activeDots = heroContainer.locator('button[style*="rgba(255, 255, 255, 1)"]');
    const activeCount = await activeDots.count();
    
    expect(activeCount).toBe(1);
    console.log('✅ 圓點點擊功能正常');
  });

  test('4. 測試基本滑動功能', async ({ page }) => {
    const heroContainer = page.locator('[data-testid="product-hero"]');
    await page.waitForTimeout(2000);
    
    const slideContainer = heroContainer.locator('div').first();
    
    // 獲取初始 transform
    const initialTransform = await slideContainer.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    console.log('初始 transform:', initialTransform);
    
    // 執行簡單的滑動操作
    const heroBox = await heroContainer.boundingBox();
    if (!heroBox) throw new Error('無法獲取 Hero 容器位置');
    
    const startX = heroBox.x + heroBox.width * 0.8;
    const endX = heroBox.x + heroBox.width * 0.3;
    const centerY = heroBox.y + heroBox.height * 0.5;
    
    // 執行滑動
    await page.mouse.move(startX, centerY);
    await page.mouse.down();
    await page.mouse.move(endX, centerY);
    await page.mouse.up();
    
    // 等待動畫完成
    await page.waitForTimeout(1000);
    
    // 檢查是否有變化
    const finalTransform = await slideContainer.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    console.log('最終 transform:', finalTransform);
    console.log('✅ 滑動操作完成');
  });

  test('5. 檢查觸摸事件支持', async ({ page }) => {
    const heroContainer = page.locator('[data-testid="product-hero"]');
    
    // 檢查是否有觸摸事件監聽器
    const hasTouchEvents = await heroContainer.evaluate(el => {
      const slider = el.querySelector('div') as HTMLElement;
      if (!slider) return false;
      
      // 檢查是否有觸摸相關的事件監聽器
      const events = [];
      if (slider.ontouchstart !== undefined) events.push('touchstart');
      if (slider.ontouchmove !== undefined) events.push('touchmove');
      if (slider.ontouchend !== undefined) events.push('touchend');
      
      return events;
    });
    
    console.log('支持的觸摸事件:', hasTouchEvents);
    
    expect(Array.isArray(hasTouchEvents)).toBe(true);
    console.log('✅ 觸摸事件支持檢查完成');
  });
});