// 快速測試當前的購物車狀況
const jwt = require('jsonwebtoken');

async function quickTest() {
  const jwtSecret = '8xn3to+/9s19/bjYuyg0zyg0nWXTRvG8i+afotLpdAc=';
  
  // 1. 先加入商品（用現有用戶的token）
  const existingToken = jwt.sign(
    { 
      sub: "5b3391ac-6754-4c88-8ed9-212ed3085e32", 
      email: "test_user@example.com",
      roles: ["user"]
    }, 
    jwtSecret, 
    { expiresIn: '1h' }
  );
  
  console.log('🛒 步驟1: 加入商品到購物車');
  const addResponse = await fetch('http://127.0.0.1:3003/cart/items', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${existingToken}`,
    },
    body: JSON.stringify({
      productId: '3c0e65bb-27f5-4857-afe3-c6d987fb6fb5',
      quantity: 1,
      specs: { size: 'XL', color: 'green' }
    })
  });
  
  const addResult = await addResponse.json();
  console.log('加入商品結果:', {
    status: addResponse.status,
    hasItems: addResult.items?.length > 0,
    itemCount: addResult.items?.length || 0
  });
  
  console.log('🔍 步驟2: 立即獲取購物車');
  const getResponse = await fetch('http://127.0.0.1:3003/cart', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${existingToken}`,
    }
  });
  
  const getResult = await getResponse.json();
  console.log('獲取購物車結果:', {
    status: getResponse.status,
    hasItems: getResult.items?.length > 0,
    itemCount: getResult.items?.length || 0,
    items: getResult.items?.map(item => ({
      id: item.id,
      name: item.name,
      quantity: item.quantity
    }))
  });
  
  console.log('🔥 原始回應:', JSON.stringify(getResult, null, 2));
}

quickTest().catch(console.error);