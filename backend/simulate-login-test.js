// 模擬完整的登入購物車流程
const jwt = require('jsonwebtoken');

async function simulateCompleteFlow() {
  console.log('🚀 開始模擬完整的登入購物車流程...');
  
  const jwtSecret = '8xn3to+/9s19/bjYuyg0zyg0nWXTRvG8i+afotLpdAc=';
  
  // 1. 創建一個 NextAuth 兼容的 JWT token
  const testToken = jwt.sign(
    { 
      sub: "test-user-123", 
      email: "user@example.com",
      roles: ["user"],
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (60 * 60) // 1 hour
    }, 
    jwtSecret
  );
  
  console.log('✅ 創建測試用戶 JWT token');
  
  // 2. 使用 Cookie 模擬 NextAuth session
  const sessionCookie = `next-auth.session-token=${testToken}`;
  
  console.log('📍 步驟 1: 測試前端購物車 API（帶認證）');
  const cartResponse = await fetch('http://localhost:3000/api/cart', {
    headers: {
      'Cookie': sessionCookie,
      'Content-Type': 'application/json'
    }
  });
  
  const cartData = await cartResponse.json();
  console.log('🛒 前端 API 購物車結果:', {
    status: cartResponse.status,
    itemCount: cartData.items?.length || 0,
    userId: cartData.userId,
    sessionId: cartData.sessionId
  });
  
  console.log('📍 步驟 2: 加入商品到購物車（透過前端 API）');
  const addResponse = await fetch('http://localhost:3000/api/cart/items', {
    method: 'POST',
    headers: {
      'Cookie': sessionCookie,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      productId: '3c0e65bb-27f5-4857-afe3-c6d987fb6fb5',
      quantity: 2,
      specs: { size: 'M', color: 'red' }
    })
  });
  
  console.log('加入商品狀態:', addResponse.status);
  
  if (addResponse.ok) {
    const addResult = await addResponse.json();
    console.log('加入商品成功，返回商品數:', addResult.items?.length || 0);
    
    console.log('📍 步驟 3: 重新取得購物車');
    const finalCartResponse = await fetch('http://localhost:3000/api/cart', {
      headers: {
        'Cookie': sessionCookie,
        'Content-Type': 'application/json'
      }
    });
    
    const finalCartData = await finalCartResponse.json();
    console.log('🎉 最終購物車結果:', {
      status: finalCartResponse.status,
      itemCount: finalCartData.items?.length || 0,
      items: finalCartData.items?.map(item => ({
        name: item.name,
        quantity: item.quantity
      })) || []
    });
  } else {
    console.error('❌ 加入商品失敗:', addResponse.status, await addResponse.text());
  }
}

simulateCompleteFlow().catch(console.error);