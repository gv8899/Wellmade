'use client';
import React from 'react';
import { useCart } from '@/CartContext';
import Image from 'next/image';
import Link from 'next/link';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  cover: string;
}

export default function CartPage() {
  const { cartItems, updateQuantity, removeFromCart, totalAmount } = useCart();

  if (!cartItems) {
    return <div className="text-center py-16">載入中...</div>;
  }

  // 商品總數量
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // 勾選狀態：預設全部勾選
  const [selectedIds, setSelectedIds] = React.useState<string[]>(cartItems.map(i => i.id));
  React.useEffect(() => {
    // 當 cartItems 變動時自動同步勾選（如刪除商品）
    setSelectedIds(ids => ids.filter(id => cartItems.some(item => item.id === id)));
  }, [cartItems]);
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
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center py-6">
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
            <button
              className="w-full bg-gray-900 text-white text-lg font-bold py-4 mt-6 mb-2 transition hover:bg-gray-700 rounded-md disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed"
              disabled={checkedItems.length === 0}
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
