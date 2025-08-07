/**
 * 樂觀更新測試腳本
 * 此腳本模擬購物車樂觀更新流程
 */

// 模擬購物車狀態
let cartItems = [
  {
    id: 'test-item-1',
    name: '測試商品 1',
    price: 100,
    quantity: 2,
    cover: ''
  }
];

// 模擬 setState 函數
function setCartItems(newItems) {
  cartItems = Array.isArray(newItems) ? newItems : newItems(cartItems);
  console.log('✅ 界面更新:', cartItems.map(item => ({ 
    id: item.id, 
    name: item.name, 
    quantity: item.quantity 
  })));
}

// 模擬 API 調用
async function mockApiCall(itemId, quantity, shouldFail = false) {
  console.log(`📡 API 調用: updateQuantity(${itemId}, ${quantity})`);
  
  // 模擬網路延遲
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  if (shouldFail) {
    throw new Error('API 調用失敗');
  }
  
  return { success: true, data: { id: itemId, quantity } };
}

// 模擬樂觀更新函數
async function updateQuantityOptimistic(itemId, quantity, shouldFail = false) {
  console.log(`🚀 開始樂觀更新: ${itemId} -> ${quantity}`);
  
  // 1. 樂觀更新：立即更新本地狀態
  const currentItems = [...cartItems];
  const targetIndex = currentItems.findIndex(item => item.id === itemId);
  
  if (targetIndex >= 0) {
    const oldQuantity = currentItems[targetIndex].quantity;
    currentItems[targetIndex].quantity = quantity;
    setCartItems(currentItems);  // 立即更新界面
    console.log('⚡ 樂觀更新完成，界面已更新');
    
    try {
      // 2. 後台同步：調用 API 同步到後端
      const response = await mockApiCall(itemId, quantity, shouldFail);
      if (response.success) {
        console.log('✅ API 同步成功');
        return true;
      } else {
        throw new Error('API 響應失敗');
      }
    } catch (apiError) {
      // API 錯誤：回滾樂觀更新
      console.error('❌ API 調用失敗，回滾樂觀更新:', apiError.message);
      currentItems[targetIndex].quantity = oldQuantity;
      setCartItems(currentItems);
      return false;
    }
  } else {
    console.warn('⚠️ 找不到要更新的商品:', itemId);
    return false;
  }
}

// 測試成功情況
async function testSuccessCase() {
  console.log('\n=== 測試成功情況 ===');
  console.log('初始狀態:', cartItems[0].quantity);
  
  const success = await updateQuantityOptimistic('test-item-1', 5, false);
  console.log('最終結果:', success ? '成功' : '失敗');
  console.log('最終狀態:', cartItems[0].quantity);
}

// 測試失敗情況
async function testFailureCase() {
  console.log('\n=== 測試失敗情況 ===');
  console.log('初始狀態:', cartItems[0].quantity);
  
  const success = await updateQuantityOptimistic('test-item-1', 3, true);
  console.log('最終結果:', success ? '成功' : '失敗');
  console.log('最終狀態:', cartItems[0].quantity);
}

// 執行測試
async function runTests() {
  await testSuccessCase();
  await testFailureCase();
}

console.log('🧪 開始樂觀更新測試...');
runTests().catch(console.error);