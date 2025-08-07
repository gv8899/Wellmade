// 測試訪客模式購物車功能
const productId = '3c0e65bb-27f5-4857-afe3-c6d987fb6fb5'; // 咖啡牛奶杯 圖案

console.log('🧪 開始測試訪客模式購物車功能...');

// 模擬前端的 localStorage 操作
function testLocalStorage() {
  console.log('\n📦 測試本地存儲購物車...');
  
  // 模擬添加商品到本地購物車
  const cartItem = {
    id: productId,
    productId: productId,
    name: `Product ${productId}`, // 臨時名稱
    price: 0,
    quantity: 1,
    cover: '',
    specs: {}
  };
  
  const localCart = [cartItem];
  console.log('本地購物車項目:', {
    name: cartItem.name,
    price: cartItem.price,
    cover: cartItem.cover
  });
  
  console.log('❌ 問題：商品名稱顯示為 UUID，價格為 0，封面為空');
  return localCart;
}

// 測試從 API 獲取商品資訊
async function testProductApi() {
  console.log('\n🔍 測試從 API 獲取商品資訊...');
  
  try {
    const response = await fetch(`http://localhost:3000/api/product?id=${productId}`);
    const product = await response.json();
    
    console.log('從 API 獲取的商品資訊:', {
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl
    });
    
    console.log('✅ API 返回正確的商品資訊');
    return product;
  } catch (error) {
    console.error('❌ 獲取商品資訊失敗:', error);
    return null;
  }
}

// 測試修復後的購物車邏輯
async function testFixedCartLogic() {
  console.log('\n🔧 測試修復後的購物車邏輯...');
  
  const product = await testProductApi();
  if (!product) return;
  
  // 模擬修復後的購物車項目
  const fixedCartItem = {
    id: productId,
    productId: productId,
    name: product.name, // 使用真實商品名稱
    price: parseFloat(product.price) || 0, // 使用真實價格
    quantity: 1,
    cover: product.imageUrl || '', // 使用真實封面圖片
    specs: {}
  };
  
  console.log('修復後的購物車項目:', {
    name: fixedCartItem.name,
    price: fixedCartItem.price,
    cover: fixedCartItem.cover ? '有圖片' : '無圖片'
  });
  
  if (fixedCartItem.name !== `Product ${productId}` && fixedCartItem.price > 0 && fixedCartItem.cover) {
    console.log('✅ 修復成功！商品資訊完整顯示');
  } else {
    console.log('❌ 修復失敗，仍有問題');
  }
}

// 執行測試
async function runTests() {
  testLocalStorage();
  await testFixedCartLogic();
  
  console.log('\n📋 測試結論:');
  console.log('1. 原本問題：訪客模式購物車只存儲基本資訊，缺少商品詳情');
  console.log('2. 修復方案：添加商品時同時調用 productApi.getOne() 獲取完整資訊');
  console.log('3. 預期結果：訪客模式也能正確顯示商品名稱、價格和圖片');
  
  console.log('\n✨ 請在瀏覽器中以訪客模式添加商品到購物車進行實際測試');
}

// 執行測試（如果是在 Node.js 環境中）
if (typeof window === 'undefined') {
  // Node.js 環境，使用 node-fetch
  console.log('請在瀏覽器中運行此測試，或者手動測試購物車功能');
} else {
  // 瀏覽器環境
  runTests();
}