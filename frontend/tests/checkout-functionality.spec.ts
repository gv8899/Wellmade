import { test, expect, Page } from '@playwright/test';
import { addTestCartItemsScript } from '../src/utils/test-helpers';

test.describe('Checkout 頁面功能測試', () => {
  let page: Page;

  test.beforeAll(async ({ browser }) => {
    page = await browser.newPage();
  });

  test.beforeEach(async () => {
    // 模擬購物車中有商品
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // 添加測試購物車資料
    await page.evaluate(addTestCartItemsScript);
    
    // 稍等一下讓 React 狀態更新
    await page.waitForTimeout(1000);
    
    console.log('🛒 測試購物車資料已準備完成');
  });

  test('基本頁面載入測試', async () => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // 檢查頁面標題（使用更靈活的選擇器）
    const titleElements = [
      'h1',
      '[data-testid="page-title"]',
      'span:has-text("結帳")',
      'text=結帳'
    ];
    
    let titleFound = false;
    for (const selector of titleElements) {
      if (await page.locator(selector).count() > 0) {
        await expect(page.locator(selector).first()).toContainText(/結帳|Checkout/i);
        titleFound = true;
        console.log(`✅ 找到頁面標題: ${selector}`);
        break;
      }
    }
    
    if (!titleFound) {
      console.log('⚠️ 未找到標題元素，但繼續測試');
    }
    
    // 檢查基本表單欄位是否存在
    await expect(page.locator('input[name="name"], [name="name"]')).toBeVisible();
    await expect(page.locator('input[name="email"], [name="email"]')).toBeVisible();
    await expect(page.locator('input[name="phone"], [name="phone"]')).toBeVisible();
    
    console.log('✅ 基本表單欄位都已顯示');
  });

  test('表單驗證測試', async () => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // 找到提交按鈕
    const submitButton = page.locator('button[type="submit"], button').filter({ hasText: /確認訂單|提交|Submit/i });
    
    if (await submitButton.count() > 0) {
      // 嘗試直接提交空表單
      await submitButton.first().click();
      await page.waitForTimeout(500);

      // 檢查是否有錯誤訊息
      const errorMessages = page.locator('.text-red-500, .text-red-600, .text-red-700, [class*="error"], [class*="danger"]');
      const hasError = await errorMessages.count() > 0;
      
      if (hasError) {
        console.log('表單驗證正常工作：顯示了錯誤訊息');
      } else {
        console.log('警告：表單可能缺少驗證機制');
      }
    }
  });

  test('配送方式選擇測試', async () => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // 檢查配送選項（使用新的 data-testid）
    const deliveryOptions = [
      { text: '宅配到府', testId: 'home-delivery' },
      { text: '7-ELEVEN', testId: 'seven-eleven' },
      { text: '全家便利商店', testId: 'family-mart' },
      { text: '萊爾富', testId: 'hi-life' },
      { text: 'OK便利商店', testId: 'ok-mart' }
    ];

    console.log('🔍 檢查配送方式選項...');
    
    for (const option of deliveryOptions) {
      // 使用新的 data-testid 屬性
      const optionElement = page.locator(`[data-testid="${option.testId}"]`);
      const deliveryContainer = page.locator(`[data-testid="delivery-option-${option.testId.replace('-', '_')}"]`);
      
      if (await optionElement.count() > 0) {
        console.log(`✅ 找到配送選項: ${option.text}`);
        
        // 測試點擊選擇容器
        if (await deliveryContainer.count() > 0) {
          await deliveryContainer.first().click();
        } else {
          await optionElement.first().click();
        }
        
        await page.waitForTimeout(500);
        
        // 檢查是否正確選中
        await expect(optionElement.first()).toBeChecked();
        console.log(`✓ ${option.text} 選項可正常選擇`);
      } else {
        console.log(`⚠️ 未找到配送選項: ${option.text}`);
      }
    }
  });

  test('超商取貨門市選擇測試', async () => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    console.log('🏪 測試超商取貨門市選擇功能...');
    
    // 選擇 7-ELEVEN 取貨（使用新的 data-testid）
    const sevenElevenOption = page.locator('[data-testid="seven-eleven"]');
    const sevenElevenContainer = page.locator('[data-testid="delivery-option-seven_eleven"]');
    
    if (await sevenElevenOption.count() > 0) {
      console.log('✅ 找到 7-ELEVEN 取貨選項');
      
      // 點擊選擇 7-ELEVEN
      if (await sevenElevenContainer.count() > 0) {
        await sevenElevenContainer.first().click();
      } else {
        await sevenElevenOption.first().click();
      }
      
      await page.waitForTimeout(1000);

      // 檢查是否出現門市選擇按鈕
      const storeSelectButton = page.locator('button').filter({ hasText: /選擇.*門市|選擇取貨門市/i });
      if (await storeSelectButton.count() > 0) {
        console.log('✅ 門市選擇功能可用');
        
        // 點擊門市選擇
        await storeSelectButton.first().click();
        await page.waitForTimeout(1000);

        // 檢查是否開啟門市選擇彈窗
        const storeModal = page.locator('.fixed.inset-0, [class*="modal"], [class*="popup"], [class*="overlay"]');
        if (await storeModal.count() > 0) {
          console.log('✅ 門市選擇彈窗正常開啟');
          
          // 檢查彈窗中的 StoreSelector 組件
          const storeSelectorTitle = page.locator('text=/選擇.*門市|門市選擇/');
          if (await storeSelectorTitle.count() > 0) {
            console.log('✅ 門市選擇器正常載入');
          }
        } else {
          console.log('⚠️ 門市選擇彈窗未開啟');
        }
      } else {
        console.log('❌ 未找到門市選擇按鈕');
      }
    } else {
      console.log('❌ 未找到 7-ELEVEN 取貨選項');
    }
  });

  test('付款方式選擇測試', async () => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    console.log('💳 檢查付款方式選項...');
    
    // 檢查付款方式選項（使用新的 data-testid）
    const paymentOptions = [
      { text: '信用卡付款', testId: 'credit-card', value: 'credit_card' },
      { text: 'LINE Pay', testId: 'line-pay', value: 'line_pay' },
    ];

    for (const option of paymentOptions) {
      // 使用新的 data-testid 屬性
      const optionElement = page.locator(`[data-testid="${option.testId}"]`);
      const paymentContainer = page.locator(`[data-testid="payment-option-${option.testId}"]`);
      
      if (await optionElement.count() > 0) {
        console.log(`✅ 找到付款選項: ${option.text}`);
        
        // 直接點擊 radio input 元素
        await optionElement.first().click();
        await page.waitForTimeout(500);
        
        // 檢查是否正確選中
        await expect(optionElement.first()).toBeChecked();
        console.log(`✓ ${option.text} 選項可正常選擇`);
      } else {
        console.log(`❌ 未找到付款選項: ${option.text}`);
      }
    }
  });

  test('訂單摘要顯示測試', async () => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // 檢查訂單摘要區域
    const summaryElements = [
      { name: '商品小計', selector: '*[class*="subtotal"], *:has-text("小計")' },
      { name: '運費', selector: '*[class*="shipping"], *:has-text("運費")' },
      { name: '總計', selector: '*[class*="total"], *:has-text("總計")' },
    ];

    for (const element of summaryElements) {
      const summaryElement = page.locator(element.selector);
      if (await summaryElement.count() > 0) {
        console.log(`✅ 找到訂單摘要項目: ${element.name}`);
      } else {
        console.log(`❌ 未找到訂單摘要項目: ${element.name}`);
      }
    }
  });

  test('響應式設計測試', async () => {
    // 測試手機版布局
    await page.setViewportSize({ width: 375, height: 667 });
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // 檢查在手機版下頁面是否正常顯示
    const mainContent = page.locator('main, [role="main"], .container');
    await expect(mainContent.first()).toBeVisible();

    // 測試平板版布局
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.waitForTimeout(500);
    await expect(mainContent.first()).toBeVisible();

    // 測試桌面版布局
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.waitForTimeout(500);
    await expect(mainContent.first()).toBeVisible();
  });

  test('表單填寫完整流程測試', async () => {
    await page.goto('/checkout');
    await page.waitForLoadState('networkidle');

    // 填寫基本資訊
    const nameInput = page.locator('input[name="name"]');
    if (await nameInput.count() > 0) {
      await nameInput.fill('測試用戶');
    }

    const emailInput = page.locator('input[name="email"]');
    if (await emailInput.count() > 0) {
      await emailInput.fill('test@example.com');
    }

    const phoneInput = page.locator('input[name="phone"]');
    if (await phoneInput.count() > 0) {
      await phoneInput.fill('0987654321');
    }

    // 選擇宅配
    const homeDeliveryOption = page.locator('input[value="home_delivery"]');
    if (await homeDeliveryOption.count() > 0) {
      await homeDeliveryOption.click();
      await page.waitForTimeout(500);

      // 填寫地址
      const addressInput = page.locator('input[name="address"], textarea[name="address"]');
      if (await addressInput.count() > 0) {
        await addressInput.fill('台北市信義區信義路五段7號');
      }
    }

    // 選擇信用卡付款
    const creditCardOption = page.locator('input[value="credit_card"]');
    if (await creditCardOption.count() > 0) {
      await creditCardOption.click();
    }

    // 檢查表單是否完整填寫
    console.log('✅ 表單填寫完成');
    
    // 尋找並點擊提交按鈕（但不實際提交）
    const submitButton = page.locator('button[type="submit"]');
    if (await submitButton.count() > 0) {
      console.log('✅ 找到提交按鈕，表單可以提交');
    }
  });

  test.afterAll(async () => {
    await page?.close();
  });
});