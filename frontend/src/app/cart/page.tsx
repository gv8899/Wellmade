'use client';
import React, { useState } from 'react';
import { useCart } from '@/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cover: string;
}

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalAmount, isLoading, refreshCart, isAuthenticated } = useCart();
  const [isSyncing, setIsSyncing] = useState(false);
  // 將 useState hook 移到條件判斷之前，避免 React Hooks 順序問題
  const [selectedIds, setSelectedIds] = React.useState<string[]>([]);

  // 當 cartItems 變動時同步勾選狀態
  React.useEffect(() => {
    if (!isLoading && cartItems && cartItems.length > 0) {
      setSelectedIds(prev => {
        // 保留已有的選擇，但過濾掉不再存在的商品
        const existingSelections = prev.filter(id => cartItems.some(item => item.id === id));
        // 如果沒有任何選擇，則全選
        return existingSelections.length > 0 ? existingSelections : cartItems.map(i => i.id);
      });
    }
  }, [cartItems, isLoading]);

  // 手動同步購物車資料
  const handleSyncCart = async () => {
    setIsSyncing(true);
    try {
      await refreshCart();
      toast.success('購物車資料已更新');
    } catch (error) {
      console.error('同步購物車失敗:', error);
      toast.error('同步購物車失敗，請稍後再試');
    } finally {
      setIsSyncing(false);
    }
  };

  // 處理登入
  const handleSignIn = () => {
    signIn('google', { callbackUrl: '/cart' });
  };

  if (isLoading) {
    return <div className="text-center py-16">載入中...</div>;
  }

  // 商品總數量
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  // 當 cartItems 變動時自動同步勾選的邏輯已移至上方
  // 切換勾選
  const toggleSelect = (id: string) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]);
  };

  // 只統計勾選的商品
  const checkedItems = cartItems.filter(item => selectedIds.includes(item.id));
  const subtotal = checkedItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen w-full bg-white font-sans flex items-start justify-center">
      <div className="max-w-lg w-full px-4 py-12">
      
        {/* 登入提示 */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center">
              <div className="flex-shrink-0 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="8" x2="12" y2="12"></line>
                  <line x1="12" y1="16" x2="12.01" y2="16"></line>
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-blue-700">
                  登入後可跨裝置同步購物車。
                  <button 
                    onClick={handleSignIn}
                    className="font-medium underline ml-1"
                  >
                    立即登入
                  </button>
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 同步狀態 */}
        {isAuthenticated && (
          <div className="mb-6 flex justify-end">
            <button 
              onClick={handleSyncCart}
              disabled={isSyncing}
              className="flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
                className={`mr-1 ${isSyncing ? 'animate-spin' : ''}`}
              >
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0 1 18.8-4.3M22 12.5a10 10 0 0 1-18.8 4.2"/>
              </svg>
              {isSyncing ? '同步中...' : '同步購物車'}
            </button>
          </div>
        )}
      {/* 標題與右上角商品數量 */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-extrabold text-black">購物車明細</h1>
        <span className="text-sm text-black">共 {totalItems} 件商品</span>
      </div>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-18">購物車目前是空的</p>
          <Link
            href="/checkout"
            className="w-full flex justify-center py-3 px-4 text-base font-semibold text-white bg-gray-900 hover:bg-gray-700 transition"
          >
            前往結帳
          </Link>
        </div>
      ) : (
        <>
          {/* 商品列表（可勾選） */}
          <div className="divide-y divide-gray-100 mb-8">
            {cartItems.map((item, index) => (
              <div key={`${item.id}_${index}`} className="flex items-center py-6">
                {/* checkbox */}
                <input
                  type="checkbox"
                  className="w-5 h-5 accent-black mr-4"
                  checked={selectedIds.includes(item.id)}
                  onChange={() => toggleSelect(item.id)}
                  aria-label="選擇本商品結帳"
                />
                {/* 商品圖片 */}
                <div className="w-20 h-20 relative flex-shrink-0 bg-gray-100">
                  {item.cover ? (
                    <Image
                      src={item.cover}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-20 h-20 bg-gray-100 flex items-center justify-center text-gray-400">無圖</div>
                  )}
                </div>
                {/* 商品資訊 */}
                <div className="flex-1 ml-5">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-semibold text-base text-gray-900 leading-tight mb-1">{item.name}</div>
                      {/* 商品規格顯示 */}
                      <div className="text-xs text-gray-500 mb-2">
                        {item.specs && Object.keys(item.specs).length > 0
                          ? Object.values(item.specs).join('・')
                          : '—'}
                      </div>
                    </div>

                  </div>
                  {/* 數量選單與單價 */}
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      className="w-8 h-8 flex items-center justify-center text-lg text-gray-700 disabled:text-gray-300"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      aria-label="減少數量"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold text-base text-gray-900 select-none mx-2" style={{lineHeight:'2rem'}}>{item.quantity}</span>
                    <button
                      className="w-8 h-8 flex items-center justify-center text-lg text-gray-700"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="增加數量"
                    >
                      +
                    </button>
                    <span className="text-gray-700 font-semibold text-base ml-2">NT$ {(typeof item.price === 'number' ? item.price : 0).toFixed(0)}</span>
                  </div>
                </div>
                {/* 垃圾桶 icon（最右側，垂直置中） */}
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="text-gray-400 hover:text-red-600 transition p-2 flex items-center justify-center self-center ml-4"
                  title="移除"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h16zm-9 4v6m4-6v6" /></svg>
                </button>
              </div>
            ))}
          </div>



          {/* 勾選商品總計區塊 */}
          <div className="w-full px-2 py-4 mb-2 flex justify-between items-center">
            <span className="text-lg font-bold text-black">總計</span>
            <span className="text-2xl font-extrabold text-black">NT$ {subtotal.toFixed(0)}</span>
          </div>

          {/* 結帳按鈕 */}
          <div className="mt-8">
            {!isAuthenticated && checkedItems.length > 0 && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                建議您 <button onClick={handleSignIn} className="font-medium underline">登入會員</button> 後再進行結帳，以便紀錄訂單並累積點數。
              </div>
            )}
            <button
              className="w-full bg-gray-900 text-white text-lg font-bold py-4 mt-6 mb-2 transition hover:bg-gray-700 rounded-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={checkedItems.length === 0}
              onClick={() => {
                if (!isAuthenticated && checkedItems.length > 0) {
                  if (confirm('是否要先登入會員再結帳？\n\n登入會員可以累積點數、查詢訂單記錄。')) {
                    handleSignIn();
                    return;
                  }
                }
                // 在這裡可以直接導向結帳頁面或處理結帳流程
              }}
            >
              {checkedItems.length === 0 ? '還沒選擇要結帳的產品' : '前往結帳'}
            </button>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
