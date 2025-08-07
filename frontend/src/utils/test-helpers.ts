// 測試用的輔助功能
export const createMockCartItem = (id: string = '1', name: string = '測試商品') => ({
  id,
  productId: id,
  name,
  price: 1000,
  quantity: 1,
  imageUrl: '/images/placeholder.jpg',
  isPreorder: false,
  variantId: null,
});

export const simulateCartWithItems = () => {
  const mockCartItems = [
    createMockCartItem('1', '測試商品 A'),
    createMockCartItem('2', '測試商品 B'),
  ];
  
  // 將測試商品存入 localStorage
  localStorage.setItem('cart', JSON.stringify(mockCartItems));
  localStorage.setItem('cart-total', '2000');
  
  return mockCartItems;
};

// 清理測試數據
export const clearTestCart = () => {
  localStorage.removeItem('cart');
  localStorage.removeItem('cart-total');
};

// 為 Playwright 測試添加購物車商品的腳本
export const addTestCartItemsScript = `
  // 模擬添加商品到購物車
  window.localStorage.setItem('cart', JSON.stringify([
    {
      id: '1',
      productId: '1',
      name: '測試商品 A',
      price: 1000,
      quantity: 1,
      imageUrl: '/images/placeholder.jpg',
      isPreorder: false,
      variantId: null
    },
    {
      id: '2', 
      productId: '2',
      name: '測試商品 B',
      price: 1500,
      quantity: 2,
      imageUrl: '/images/placeholder.jpg',
      isPreorder: false,
      variantId: null
    }
  ]));
  
  window.localStorage.setItem('cart-total', '4000');
  
  // 觸發 storage 事件以更新 React 狀態
  window.dispatchEvent(new StorageEvent('storage', {
    key: 'cart',
    storageArea: localStorage
  }));
  
  console.log('✅ 測試購物車資料已添加');
`;