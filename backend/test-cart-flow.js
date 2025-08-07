const { chromium } = require('playwright');
const { Client } = require('pg');

// 資料庫連接配置
const dbConfig = {
  host: '127.0.0.1',
  port: 5432,
  user: 'wellmade_user',
  password: 'wellmade_password',
  database: 'wellmade'
};

async function testCartFlow() {
  console.log('🚀 開始購物車流程測試...');
  
  // 啟動瀏覽器
  const browser = await chromium.launch({ 
    headless: false, // 設為 false 可以看到瀏覽器操作
    slowMo: 1000 // 每個操作間隔1秒，方便觀察
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // 1. 訪問首頁
    console.log('📍 步驟 1: 訪問首頁');
    await page.goto('http://localhost:3000');
    await page.waitForTimeout(2000);
    
    // 2. 等待頁面載入完成
    console.log('📍 步驟 2: 等待頁面載入');
    await page.waitForSelector('header', { timeout: 10000 });
    
    // 3. 查找產品並點擊
    console.log('📍 步驟 3: 尋找產品');
    // 等待產品載入
    await page.waitForTimeout(5000);
    
    // 嘗試找到產品卡片或產品連結
    const productSelectors = [
      'a[href*="/products/"]',
      '.product-card',
      '[data-testid="product-item"]',
      'div[class*="product"]',
      'a[class*="product"]'
    ];
    
    let productLink = null;
    for (const selector of productSelectors) {
      const elements = await page.$$(selector);
      if (elements.length > 0) {
        productLink = elements[0];
        console.log(`✅ 找到產品，使用選擇器: ${selector}`);
        break;
      }
    }
    
    if (!productLink) {
      console.log('⚠️  未找到產品連結，嘗試直接訪問產品頁面');
      // 直接訪問一個產品頁面（需要先從資料庫獲取產品ID）
      const dbClient = new Client(dbConfig);
      await dbClient.connect();
      const result = await dbClient.query('SELECT id FROM products LIMIT 1');
      await dbClient.end();
      
      if (result.rows.length > 0) {
        const productId = result.rows[0].id;
        console.log(`📍 直接訪問產品頁面: ${productId}`);
        await page.goto(`http://localhost:3000/products/${productId}`);
      } else {
        throw new Error('資料庫中沒有產品');
      }
    } else {
      // 點擊產品
      await productLink.click();
      await page.waitForTimeout(3000);
    }
    
    // 4. 在產品頁面添加到購物車
    console.log('📍 步驟 4: 嘗試添加到購物車');
    
    const addToCartSelectors = [
      'button[class*="add-to-cart"]',
      'button[data-testid="add-to-cart"]',
      'button:has-text("加入購物車")',
      'button:has-text("Add to Cart")',
      'button[class*="cart"]'
    ];
    
    let addToCartButton = null;
    for (const selector of addToCartSelectors) {
      try {
        addToCartButton = await page.$(selector);
        if (addToCartButton) {
          console.log(`✅ 找到加入購物車按鈕，使用選擇器: ${selector}`);
          break;
        }
      } catch (e) {
        // 繼續嘗試下一個選擇器
      }
    }
    
    if (addToCartButton) {
      await addToCartButton.click();
      console.log('✅ 點擊了加入購物車按鈕');
      await page.waitForTimeout(3000);
    } else {
      console.log('⚠️  未找到加入購物車按鈕，模擬 API 調用');
      // 取得當前產品ID並直接調用 API
      const currentUrl = page.url();
      const productId = currentUrl.split('/').pop();
      console.log(`📦 使用產品ID: ${productId}`);
      
      const response = await page.evaluate(async (productId) => {
        const response = await fetch('/api/cart/items', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: productId,
            quantity: 1,
            specs: {}
          })
        });
        return await response.json();
      }, productId);
      console.log('📊 API 調用結果:', response);
    }
    
    // 5. 檢查網路請求
    console.log('📍 步驟 5: 監聽網路請求');
    page.on('response', response => {
      if (response.url().includes('/cart') || response.url().includes('/api/cart')) {
        console.log(`🌐 網路請求: ${response.request().method()} ${response.url()} - ${response.status()}`);
      }
    });
    
    // 6. 訪問購物車頁面
    console.log('📍 步驟 6: 訪問購物車頁面');
    await page.goto('http://localhost:3000/cart');
    await page.waitForTimeout(5000);
    
    // 檢查購物車內容
    const cartContent = await page.textContent('body');
    console.log('🛒 購物車頁面內容關鍵字檢查:');
    console.log('- 包含 "0 件商品":', cartContent.includes('0 件商品'));
    console.log('- 包含 "載入中":', cartContent.includes('載入中'));
    console.log('- 包含 "購物車":', cartContent.includes('購物車'));
    
    // 7. 檢查 Console 日誌
    console.log('📍 步驟 7: 檢查 Console 日誌');
    const consoleLogs = [];
    page.on('console', msg => {
      if (msg.text().includes('CART') || msg.text().includes('cart')) {
        consoleLogs.push(msg.text());
      }
    });
    
    await page.waitForTimeout(3000);
    
    if (consoleLogs.length > 0) {
      console.log('🔍 購物車相關 Console 日誌:');
      consoleLogs.forEach(log => console.log(`   ${log}`));
    }
    
  } catch (error) {
    console.error('❌ 測試過程中發生錯誤:', error);
  } finally {
    await browser.close();
  }
  
  // 8. 檢查資料庫狀態
  console.log('📍 步驟 8: 檢查資料庫購物車狀態');
  await checkDatabaseState();
}

async function checkDatabaseState() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('🔗 資料庫連接成功');
    
    // 查詢所有購物車
    const cartsResult = await client.query(`
      SELECT id, "userId", "sessionId", "createdAt", "updatedAt"
      FROM carts 
      ORDER BY "createdAt" DESC 
      LIMIT 10
    `);
    
    console.log('🛒 最近的購物車記錄:');
    cartsResult.rows.forEach(cart => {
      console.log(`   Cart ID: ${cart.id}`);
      console.log(`   User ID: ${cart.userId || '(null)'}`);
      console.log(`   Session ID: ${cart.sessionId || '(null)'}`);
      console.log(`   Created: ${cart.createdAt}`);
      console.log('   ---');
    });
    
    // 查詢購物車項目
    const itemsResult = await client.query(`
      SELECT ci.id, ci."cartId", ci."productId", ci.quantity, ci.name, ci.price
      FROM cart_items ci
      JOIN carts c ON ci."cartId" = c.id
      ORDER BY ci."createdAt" DESC 
      LIMIT 10
    `);
    
    console.log('🛍️  最近的購物車項目:');
    if (itemsResult.rows.length === 0) {
      console.log('   (無購物車項目)');
    } else {
      itemsResult.rows.forEach(item => {
        console.log(`   Item ID: ${item.id}`);
        console.log(`   Cart ID: ${item.cartId}`);
        console.log(`   Product ID: ${item.productId}`);
        console.log(`   Quantity: ${item.quantity}`);
        console.log(`   Name: ${item.name}`);
        console.log(`   Price: ${item.price}`);
        console.log('   ---');
      });
    }
    
    // 查詢產品數量
    const productsResult = await client.query('SELECT COUNT(*) as count FROM products');
    console.log(`📦 資料庫中的產品數量: ${productsResult.rows[0].count}`);
    
    // 查詢最近的產品
    const recentProductsResult = await client.query(`
      SELECT id, name, price 
      FROM products 
      WHERE "isActive" = true 
      ORDER BY "createdAt" DESC 
      LIMIT 5
    `);
    
    console.log('🏷️  最近的產品:');
    recentProductsResult.rows.forEach(product => {
      console.log(`   ${product.name} (ID: ${product.id}, Price: $${product.price})`);
    });
    
  } catch (error) {
    console.error('❌ 資料庫查詢錯誤:', error);
  } finally {
    await client.end();
    console.log('🔌 資料庫連接已關閉');
  }
}

// 執行測試
testCartFlow().catch(console.error);