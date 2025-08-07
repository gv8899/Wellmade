const { Client } = require('pg');

async function testCartWithDatabase() {
  console.log('🚀 開始直接測試購物車 API 並檢查資料庫...');
  
  // 資料庫連線配置
  const dbConfig = {
    host: '127.0.0.1',
    port: 5432,
    database: 'wellmade',
    user: 'wellmade_user',
    password: 'wellmade123'
  };
  
  const client = new Client(dbConfig);
  
  try {
    // 連接資料庫
    await client.connect();
    console.log('✅ 已連接到資料庫');
    
    // 1. 清空測試資料
    console.log('📍 步驟 1: 清空測試資料');
    await client.query('DELETE FROM carts WHERE "sessionId" LIKE \'test_%\' OR "userId" IN (SELECT id FROM users WHERE email LIKE \'test_%\')');
    await client.query('DELETE FROM users WHERE email LIKE \'test_%\'');
    console.log('✅ 測試資料已清空');
    
    // 2. 創建測試用戶（模擬 Google OAuth 註冊）
    console.log('📍 步驟 2: 創建測試用戶');
    const userResult = await client.query(`
      INSERT INTO users (id, email, username, "firstName", password, roles, "createdAt", "updatedAt")
      VALUES (gen_random_uuid(), 'test_user@example.com', 'Test User', 'Test', 'temp_password', ARRAY['user']::users_roles_enum[], NOW(), NOW())
      RETURNING *
    `);
    const testUser = userResult.rows[0];
    console.log('✅ 測試用戶已創建:', { id: testUser.id, email: testUser.email });
    
    // 3. 生成測試 JWT token（模擬認證）
    const jwt = require('jsonwebtoken');
    const jwtSecret = '8xn3to+/9s19/bjYuyg0zyg0nWXTRvG8i+afotLpdAc=';
    const testToken = jwt.sign(
      { 
        sub: testUser.id, 
        email: testUser.email,
        roles: testUser.roles 
      }, 
      jwtSecret, 
      { expiresIn: '1h' }
    );
    console.log('✅ 測試 JWT token 已生成');
    
    // 4. 獲取現有商品 ID
    console.log('📍 步驟 4: 獲取測試商品');
    const productResult = await client.query('SELECT id, name, price FROM products LIMIT 1');
    if (productResult.rows.length === 0) {
      throw new Error('❌ 資料庫中沒有商品，無法進行測試');
    }
    const testProduct = productResult.rows[0];
    console.log('✅ 找到測試商品:', { id: testProduct.id, name: testProduct.name, price: testProduct.price });
    
    // 5. 測試訪客模式加入購物車
    console.log('📍 步驟 5: 測試訪客模式加入購物車');
    const guestSessionId = 'test_guest_session_' + Date.now();
    const guestAddResponse = await fetch('http://127.0.0.1:3003/cart/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': `connect.sid=${guestSessionId}`,
      },
      body: JSON.stringify({
        productId: testProduct.id,
        quantity: 2,
        specs: { size: 'M', color: 'red' }
      })
    });
    
    const guestAddResult = await guestAddResponse.json();
    console.log('🛒 訪客加入購物車結果:', {
      status: guestAddResponse.status,
      success: guestAddResult.success,
      error: guestAddResult.error
    });
    
    // 6. 檢查訪客購物車資料庫記錄
    console.log('📍 步驟 6: 檢查訪客購物車資料庫記錄');
    
    // 查找所有相關的購物車（包括通過不同 session ID 創建的）
    const allCartsQuery = await client.query(`
      SELECT c.*, ci.*, p.name as product_name 
      FROM carts c 
      LEFT JOIN cart_items ci ON c.id = ci."cartId" 
      LEFT JOIN products p ON ci."productId" = p.id 
      WHERE c."sessionId" IS NOT NULL
      ORDER BY c."createdAt" DESC
      LIMIT 10
    `);
    
    console.log('🔍 最近創建的所有購物車:', allCartsQuery.rows.map(row => ({
      cartId: row.id,
      sessionId: row.sessionId,
      userId: row.userId,
      productName: row.product_name,
      quantity: row.quantity,
      hasItems: !!row.product_name
    })));
    
    const guestCartQuery = await client.query(`
      SELECT c.*, ci.*, p.name as product_name 
      FROM carts c 
      LEFT JOIN cart_items ci ON c.id = ci."cartId" 
      LEFT JOIN products p ON ci."productId" = p.id 
      WHERE c."sessionId" = $1
    `, [guestSessionId]);
    
    console.log('🔍 訪客購物車資料庫記錄:', guestCartQuery.rows.map(row => ({
      cartId: row.id,
      sessionId: row.sessionId,
      userId: row.userId,
      productName: row.product_name,
      quantity: row.quantity,
      specs: row.specs
    })));
    
    // 7. 測試已認證用戶加入購物車
    console.log('📍 步驟 7: 測試已認證用戶加入購物車');
    const authAddResponse = await fetch('http://127.0.0.1:3003/cart/items', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`,
        'Cookie': `connect.sid=${guestSessionId}`, // 使用相同 session 測試合併
      },
      body: JSON.stringify({
        productId: testProduct.id,
        quantity: 1,
        specs: { size: 'L', color: 'blue' }
      })
    });
    
    const authAddResult = await authAddResponse.json();
    console.log('🛒 認證用戶加入購物車結果:', {
      status: authAddResponse.status,
      success: authAddResult.success,
      error: authAddResult.error
    });
    
    // 8. 檢查認證用戶購物車資料庫記錄
    console.log('📍 步驟 8: 檢查認證用戶購物車資料庫記錄');
    const authCartQuery = await client.query(`
      SELECT c.*, ci.*, p.name as product_name 
      FROM carts c 
      JOIN cart_items ci ON c.id = ci."cartId" 
      JOIN products p ON ci."productId" = p.id 
      WHERE c."userId" = $1
    `, [testUser.id]);
    
    console.log('🔍 認證用戶購物車資料庫記錄:', authCartQuery.rows.map(row => ({
      cartId: row.id,
      sessionId: row.sessionId,
      userId: row.userId,
      productName: row.product_name,
      quantity: row.quantity,
      specs: row.specs
    })));
    
    // 9. 測試取得購物車 API
    console.log('📍 步驟 9: 測試取得購物車 API');
    const getCartResponse = await fetch('http://127.0.0.1:3003/cart', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Cookie': `connect.sid=${guestSessionId}`,
      }
    });
    
    const getCartResult = await getCartResponse.json();
    console.log('📦 取得購物車 API 結果:', {
      status: getCartResponse.status,
      rawResponse: getCartResult,
      success: getCartResult.success,
      itemCount: getCartResult.items?.length || getCartResult.data?.length || 0,
      items: (getCartResult.items || getCartResult.data || []).map(item => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        specs: item.specs
      }))
    });
    
    // 10. 測試 force-bind 端點
    console.log('📍 步驟 10: 測試 force-bind 端點');
    const forceBindResponse = await fetch('http://127.0.0.1:3003/cart/force-bind', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${testToken}`,
        'Cookie': `connect.sid=${guestSessionId}`,
      }
    });
    
    const forceBindResult = await forceBindResponse.json();
    console.log('🔧 Force-bind 結果:', {
      status: forceBindResponse.status,
      success: forceBindResult.success,
      error: forceBindResult.error
    });
    
    // 11. 最終資料庫狀態檢查
    console.log('📍 步驟 11: 最終資料庫狀態檢查');
    const finalCartQuery = await client.query(`
      SELECT c.*, ci.*, p.name as product_name 
      FROM carts c 
      LEFT JOIN cart_items ci ON c.id = ci."cartId" 
      LEFT JOIN products p ON ci."productId" = p.id 
      WHERE c."sessionId" = $1 OR c."userId" = $2
      ORDER BY c."createdAt", ci."createdAt"
    `, [guestSessionId, testUser.id]);
    
    console.log('🔍 最終購物車狀態:', finalCartQuery.rows.map(row => ({
      cartId: row.id,
      sessionId: row.sessionId,
      userId: row.userId,
      productName: row.product_name,
      quantity: row.quantity,
      specs: row.specs,
      hasItems: !!row.product_name
    })));
    
    // 總結
    console.log('\n📊 測試總結:');
    console.log('- 訪客購物車記錄數:', guestCartQuery.rows.length);
    console.log('- 認證用戶購物車記錄數:', authCartQuery.rows.length);
    console.log('- API 回傳商品數:', getCartResult.data?.length || 0);
    console.log('- Force-bind 狀態:', forceBindResponse.status === 200 ? '成功' : '失敗');
    
  } catch (error) {
    console.error('❌ 測試錯誤:', error);
  } finally {
    await client.end();
    console.log('✅ 資料庫連線已關閉');
  }
}

testCartWithDatabase().catch(console.error);