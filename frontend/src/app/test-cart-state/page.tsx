'use client';

import React, { useEffect } from 'react';
import { useCart } from '@/CartContext';
import { useSession } from 'next-auth/react';

export default function TestCartStatePage() {
  const { 
    cartItems, 
    totalAmount, 
    isLoading, 
    error, 
    isAuthenticated, 
    refreshCart,
    addToCart,
    clearCart
  } = useCart();
  
  const { data: session, status } = useSession();

  useEffect(() => {
    console.log('🧪 [TEST] 測試頁面購物車狀態:', {
      cartItemsCount: cartItems?.length || 0,
      totalAmount,
      isLoading,
      error,
      isAuthenticated,
      sessionStatus: status,
      hasSession: !!session
    });
  }, [cartItems, totalAmount, isLoading, error, isAuthenticated, status, session]);

  const handleAddTestProduct = async () => {
    console.log('🧪 [TEST] 手動添加測試商品');
    // 添加一個測試商品
    const success = await addToCart({
      productId: 'test-product-123',
      quantity: 1,
      specs: { size: 'M', color: 'red' }
    });
    console.log('🧪 [TEST] 添加測試商品結果:', success);
  };

  const handleRefreshCart = async () => {
    console.log('🧪 [TEST] 手動刷新購物車');
    await refreshCart();
  };

  const handleClearCart = async () => {
    console.log('🧪 [TEST] 手動清空購物車');
    await clearCart();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">購物車狀態測試頁面</h1>
        
        {/* 購物車狀態顯示 */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">購物車狀態</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>載入中:</strong> {isLoading ? '是' : '否'}
            </div>
            <div>
              <strong>已認證:</strong> {isAuthenticated ? '是' : '否'}
            </div>
            <div>
              <strong>商品數量:</strong> {cartItems?.length || 0}
            </div>
            <div>
              <strong>總金額:</strong> NT$ {totalAmount?.toLocaleString() || 0}
            </div>
            <div className="col-span-2">
              <strong>錯誤訊息:</strong> {error || '無'}
            </div>
            <div>
              <strong>會話狀態:</strong> {status}
            </div>
            <div>
              <strong>有會話:</strong> {session ? '是' : '否'}
            </div>
          </div>
        </div>

        {/* 購物車商品列表 */}
        <div className="bg-white rounded-lg p-6 mb-6 shadow">
          <h2 className="text-xl font-semibold mb-4">購物車商品</h2>
          {cartItems && cartItems.length > 0 ? (
            <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div key={item.id} className="border-b pb-2">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        ID: {item.id} | 數量: {item.quantity} | 單價: NT$ {item.price}
                      </div>
                      {item.specs && Object.keys(item.specs).length > 0 && (
                        <div className="text-xs text-gray-400">
                          規格: {JSON.stringify(item.specs)}
                        </div>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        NT$ {(item.price * item.quantity).toLocaleString()}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500">購物車是空的</p>
          )}
        </div>

        {/* 控制按鈕 */}
        <div className="bg-white rounded-lg p-6 shadow">
          <h2 className="text-xl font-semibold mb-4">測試操作</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={handleAddTestProduct}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              添加測試商品
            </button>
            <button
              onClick={handleRefreshCart}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
            >
              刷新購物車
            </button>
            <button
              onClick={handleClearCart}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
            >
              清空購物車
            </button>
            <button
              onClick={() => window.open('/checkout', '_blank')}
              className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
            >
              打開結帳頁面 (新視窗)
            </button>
          </div>
        </div>

        {/* 除錯資訊 */}
        <div className="bg-gray-100 rounded-lg p-6 mt-6">
          <h2 className="text-xl font-semibold mb-4">除錯資訊</h2>
          <div className="text-xs font-mono">
            <div><strong>當前時間:</strong> {new Date().toLocaleString()}</div>
            <div><strong>頁面載入時間:</strong> {new Date().toISOString()}</div>
          </div>
        </div>
      </div>
    </div>
  );
}