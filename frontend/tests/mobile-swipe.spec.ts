import { test, expect, type Page, type Locator } from '@playwright/test';

/**
 * ProductHero 組件手機端滑動體驗測試
 * 測試功能：
 * 1. 觸摸滑動的連續性和跟隨效果
 * 2. 滑動閾值和圖片切換邏輯
 * 3. 回彈效果和邊界處理
 * 4. 圓點指示器更新
 */

// 測試產品 ID (從後端數據取得)
const PRODUCT_ID = '945410d3-fe4b-4614-8682-3f9f8b45026b'; // 手沖壺 (有 4 張圖片)

// 滑動相關常數
const SWIPE_THRESHOLD = 100; // 滑動閾值
const SWIPE_SPEED = 10; // 滑動速度 (pixel per step)

test.describe('ProductHero 手機端滑動測試', () => {
  
  test.beforeEach(async ({ page }) => {
    // 導航到產品頁面
    await page.goto(`/product/${PRODUCT_ID}`);
    
    // 等待頁面和圖片加載完成
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('[data-testid="product-hero"]', { timeout: 10000 });
  });

  test('1. 觸摸滑動時圖片應該跟隨手指移動（連續性測試）', async ({ page }) => {
    const heroContainer = page.locator('[data-testid="product-hero"]').first();
    await expect(heroContainer).toBeVisible();

    const slideContainer = heroContainer.locator('div').first(); // 滑動容器
    
    // 獲取初始位置
    const initialTransform = await slideContainer.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    // 開始觸摸滑動
    const heroBox = await heroContainer.boundingBox();
    if (!heroBox) throw new Error('無法獲取 Hero 容器位置');
    
    const startX = heroBox.x + heroBox.width * 0.8; // 從右側 80% 開始
    const startY = heroBox.y + heroBox.height * 0.5; // 垂直中點
    const endX = heroBox.x + heroBox.width * 0.2;   // 滑動到左側 20%
    
    // 執行觸摸滑動（模擬手指跟隨）
    await page.touchscreen.tap(startX, startY);
    
    // 分步滑動以測試連續性
    const steps = 10;
    const stepX = (endX - startX) / steps;
    
    for (let i = 0; i <= steps; i++) {
      const currentX = startX + (stepX * i);
      
      if (i === 0) {
        // 開始觸摸
        await page.mouse.move(currentX, startY);
        await page.mouse.down();
      } else if (i === steps) {
        // 結束觸摸
        await page.mouse.move(currentX, startY);
        await page.mouse.up();
      } else {
        // 中間移動
        await page.mouse.move(currentX, startY);
        await page.waitForTimeout(50); // 短暫延遲模擬真實滑動
        
        // 檢查圖片是否跟隨移動
        const currentTransform = await slideContainer.evaluate(el => {
          return window.getComputedStyle(el).transform;
        });
        
        // 驗證 transform 值有變化（跟隨手指）
        expect(currentTransform).not.toBe(initialTransform);
      }
    }
  });

  test('2. 滑動距離超過閾值時應正確切換圖片', async ({ page }) => {
    const heroContainer = page.locator('[data-testid="product-hero"]').first();
    await expect(heroContainer).toBeVisible();
    
    // 檢查是否有多張圖片（圓點指示器）
    const dots = heroContainer.locator('button[aria-label*=\"切換到圖片\"]');
    const dotCount = await dots.count();
    
    if (dotCount <= 1) {
      console.log('此產品只有一張圖片，跳過切換測試');
      return;
    }
    
    // 獲取初始圓點狀態
    const activeDotInitial = heroContainer.locator('button[style*=\"rgba(255, 255, 255, 1)\"]');
    await expect(activeDotInitial).toHaveCount(1);
    
    // 執行向左滑動（超過閾值）
    const heroBox = await heroContainer.boundingBox();
    if (!heroBox) throw new Error('無法獲取 Hero 容器位置');
    
    const startX = heroBox.x + heroBox.width * 0.8;
    const endX = heroBox.x + heroBox.width * 0.2; // 滑動距離超過 100px
    const centerY = heroBox.y + heroBox.height * 0.5;
    
    // 執行滑動
    await page.mouse.move(startX, centerY);
    await page.mouse.down();
    await page.mouse.move(endX, centerY, { steps: 10 });
    await page.mouse.up();
    
    // 等待動畫完成
    await page.waitForTimeout(500);
    
    // 驗證圓點指示器已更新（切換到下一張圖片）
    const activeDotAfter = heroContainer.locator('button[style*=\"rgba(255, 255, 255, 1)\"]');
    await expect(activeDotAfter).toHaveCount(1);
    
    // 驗證確實切換了圖片（透過圓點位置變化）
    const activeDotIndexAfter = await activeDotAfter.getAttribute('aria-label');
    expect(activeDotIndexAfter).toContain('圖片 2');
  });

  test('3. 滑動距離不足時應回彈到原位置', async ({ page }) => {
    const heroContainer = page.locator('[data-testid="product-hero"]').first();
    await expect(heroContainer).toBeVisible();
    
    const slideContainer = heroContainer.locator('div').first();
    
    // 獲取初始 transform 值
    const initialTransform = await slideContainer.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    // 執行短距離滑動（不超過閾值）
    const heroBox = await heroContainer.boundingBox();
    if (!heroBox) throw new Error('無法獲取 Hero 容器位置');
    
    const startX = heroBox.x + heroBox.width * 0.5;
    const endX = startX - 50; // 只滑動 50px，小於閾值
    const centerY = heroBox.y + heroBox.height * 0.5;
    
    // 執行滑動
    await page.mouse.move(startX, centerY);
    await page.mouse.down();
    await page.mouse.move(endX, centerY, { steps: 5 });
    await page.mouse.up();
    
    // 等待回彈動畫完成
    await page.waitForTimeout(500);
    
    // 驗證回彈到原位置
    const finalTransform = await slideContainer.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    expect(finalTransform).toBe(initialTransform);
  });

  test('4. 邊界處理：第一張圖片時向右滑動應無效', async ({ page }) => {
    const heroContainer = page.locator('[data-testid="product-hero"]').first();
    await expect(heroContainer).toBeVisible();
    
    // 確保在第一張圖片
    const firstDot = heroContainer.locator('button[aria-label*=\"切換到圖片 1\"]');
    if (await firstDot.count() > 0) {
      await firstDot.click();
      await page.waitForTimeout(300);
    }
    
    const slideContainer = heroContainer.locator('div').first();
    
    // 獲取初始位置
    const initialTransform = await slideContainer.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    // 向右滑動（嘗試滑到上一張，但已經是第一張）
    const heroBox = await heroContainer.boundingBox();
    if (!heroBox) throw new Error('無法獲取 Hero 容器位置');
    
    const startX = heroBox.x + heroBox.width * 0.2;
    const endX = heroBox.x + heroBox.width * 0.8; // 向右滑動
    const centerY = heroBox.y + heroBox.height * 0.5;
    
    // 執行滑動
    await page.mouse.move(startX, centerY);
    await page.mouse.down();
    await page.mouse.move(endX, centerY, { steps: 10 });
    await page.mouse.up();
    
    // 等待動畫完成
    await page.waitForTimeout(500);
    
    // 驗證位置沒有改變
    const finalTransform = await slideContainer.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    expect(finalTransform).toBe(initialTransform);
  });

  test('5. 邊界處理：最後一張圖片時向左滑動應無效', async ({ page }) => {
    const heroContainer = page.locator('[data-testid="product-hero"]').first();
    await expect(heroContainer).toBeVisible();
    
    // 檢查是否有多張圖片
    const dots = heroContainer.locator('button[aria-label*=\"切換到圖片\"]');
    const dotCount = await dots.count();
    
    if (dotCount <= 1) {
      console.log('此產品只有一張圖片，跳過邊界測試');
      return;
    }
    
    // 跳到最後一張圖片
    const lastDot = heroContainer.locator(`button[aria-label*=\"切換到圖片 ${dotCount}\"]`);
    await lastDot.click();
    await page.waitForTimeout(300);
    
    const slideContainer = heroContainer.locator('div').first();
    
    // 獲取最後一張的位置
    const initialTransform = await slideContainer.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    // 向左滑動（嘗試滑到下一張，但已經是最後一張）
    const heroBox = await heroContainer.boundingBox();
    if (!heroBox) throw new Error('無法獲取 Hero 容器位置');
    
    const startX = heroBox.x + heroBox.width * 0.8;
    const endX = heroBox.x + heroBox.width * 0.2; // 向左滑動
    const centerY = heroBox.y + heroBox.height * 0.5;
    
    // 執行滑動
    await page.mouse.move(startX, centerY);
    await page.mouse.down();
    await page.mouse.move(endX, centerY, { steps: 10 });
    await page.mouse.up();
    
    // 等待動畫完成
    await page.waitForTimeout(500);
    
    // 驗證位置沒有改變
    const finalTransform = await slideContainer.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    expect(finalTransform).toBe(initialTransform);
  });

  test('6. 圓點指示器點擊功能測試', async ({ page }) => {
    const heroContainer = page.locator('[data-testid="product-hero"]').first();
    await expect(heroContainer).toBeVisible();
    
    // 檢查是否有多張圖片
    const dots = heroContainer.locator('button[aria-label*=\"切換到圖片\"]');
    const dotCount = await dots.count();
    
    if (dotCount <= 1) {
      console.log('此產品只有一張圖片，跳過圓點測試');
      return;
    }
    
    // 測試每個圓點的點擊功能
    for (let i = 1; i <= dotCount; i++) {
      const targetDot = heroContainer.locator(`button[aria-label*=\"切換到圖片 ${i}\"]`);
      await targetDot.click();
      await page.waitForTimeout(400); // 等待動畫
      
      // 驗證圓點狀態更新
      const activeDot = heroContainer.locator('button[style*=\"rgba(255, 255, 255, 1)\"]');
      await expect(activeDot).toHaveCount(1);
      
      const activeLabel = await activeDot.getAttribute('aria-label');
      expect(activeLabel).toContain(`圖片 ${i}`);
    }
  });

  test('7. 滑動流暢性測試：快速連續滑動', async ({ page }) => {
    const heroContainer = page.locator('[data-testid="product-hero"]').first();
    await expect(heroContainer).toBeVisible();
    
    // 檢查是否有多張圖片
    const dots = heroContainer.locator('button[aria-label*=\"切換到圖片\"]');
    const dotCount = await dots.count();
    
    if (dotCount <= 1) {
      console.log('此產品只有一張圖片，跳過流暢性測試');
      return;
    }
    
    const heroBox = await heroContainer.boundingBox();
    if (!heroBox) throw new Error('無法獲取 Hero 容器位置');
    
    const centerY = heroBox.y + heroBox.height * 0.5;
    
    // 執行快速連續滑動
    for (let i = 0; i < 3; i++) {
      const startX = heroBox.x + heroBox.width * 0.8;
      const endX = heroBox.x + heroBox.width * 0.2;
      
      await page.mouse.move(startX, centerY);
      await page.mouse.down();
      await page.mouse.move(endX, centerY, { steps: 5 }); // 快速滑動
      await page.mouse.up();
      
      await page.waitForTimeout(100); // 短暫間隔
    }
    
    // 等待所有動畫完成
    await page.waitForTimeout(1000);
    
    // 驗證最終狀態穩定
    const activeDot = heroContainer.locator('button[style*=\"rgba(255, 255, 255, 1)\"]');
    await expect(activeDot).toHaveCount(1);
  });

  test('8. 觸摸設備特定功能測試', async ({ page }) => {
    const heroContainer = page.locator('[data-testid="product-hero"]').first();
    await expect(heroContainer).toBeVisible();
    
    const heroBox = await heroContainer.boundingBox();
    if (!heroBox) throw new Error('無法獲取 Hero 容器位置');
    
    const startX = heroBox.x + heroBox.width * 0.7;
    const endX = heroBox.x + heroBox.width * 0.3;
    const centerY = heroBox.y + heroBox.height * 0.5;
    
    // 使用 touchscreen API 進行觸摸滑動
    await page.touchscreen.tap(startX, centerY);
    
    // 模擬觸摸滑動
    await page.evaluate(async ({ startX, startY, endX, endY }) => {
      const element = document.querySelector('[data-testid=\"product-hero\"] div') as HTMLElement;
      if (!element) return;
      
      // 觸發 touchstart
      const touchStart = new TouchEvent('touchstart', {
        changedTouches: [new Touch({
          identifier: 1,
          target: element,
          clientX: startX,
          clientY: startY,
        })]
      });
      element.dispatchEvent(touchStart);
      
      // 觸發 touchmove
      const touchMove = new TouchEvent('touchmove', {
        changedTouches: [new Touch({
          identifier: 1,
          target: element,
          clientX: endX,
          clientY: endY,
        })]
      });
      element.dispatchEvent(touchMove);
      
      // 觸發 touchend
      const touchEnd = new TouchEvent('touchend', {
        changedTouches: [new Touch({
          identifier: 1,
          target: element,
          clientX: endX,
          clientY: endY,
        })]
      });
      element.dispatchEvent(touchEnd);
    }, { startX, startY: centerY, endX, endY: centerY });
    
    // 等待動畫完成
    await page.waitForTimeout(500);
    
    // 驗證滑動有效果
    const slideContainer = heroContainer.locator('div').first();
    const transform = await slideContainer.evaluate(el => {
      return window.getComputedStyle(el).transform;
    });
    
    // 確保 transform 不是初始值 'none'
    expect(transform).not.toBe('none');
  });
});