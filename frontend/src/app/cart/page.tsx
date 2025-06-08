'use client';
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
          <p className="text-gray-400 text-lg">購物車目前是空的</p>
          <Link href="/" className="mt-6 inline-block bg-gray-900 text-white px-6 py-2 font-semibold hover:bg-gray-700 transition">
            繼續購物
          </Link>
        </div>
      ) : (
        <>
          {/* 商品列表 */}
          <div className="divide-y divide-gray-100 mb-8">
            {cartItems.map((item) => (
              <div key={item.id} className="flex items-center py-6">
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
                        {item.spec && Object.keys(item.spec).length > 0
                          ? Object.values(item.spec).join('・')
                          : '—'}
                      </div>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-gray-400 hover:text-red-600 transition p-2"
                      title="移除"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6h16zm-9 4v6m4-6v6" /></svg>
                    </button>
                  </div>
                  {/* 數量選單與單價 */}
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      className="w-8 h-8 flex items-center justify-center border text-lg text-gray-700 disabled:text-gray-300"
                      onClick={() => updateQuantity(item.id, Math.max(1, item.quantity - 1))}
                      disabled={item.quantity <= 1}
                      aria-label="減少數量"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-semibold text-base text-gray-900 select-none">{item.quantity}</span>
                    <button
                      className="w-8 h-8 flex items-center justify-center border text-lg text-gray-700"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      aria-label="增加數量"
                    >
                      +
                    </button>
                    <span className="text-gray-700 font-semibold text-base ml-2">NT$ {item.price.toFixed(0)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 小計/運費/稅金/總計 */}
          <div className="pt-6 pb-2 mb-2">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">小計：</span>
              <span className="text-gray-900 font-semibold">NT$ {totalAmount.toFixed(0)}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">運費：</span>
              <span className="text-gray-900 font-semibold">NT$ 0</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-500">稅金：</span>
              <span className="text-gray-900 font-semibold">NT$ 0</span>
            </div>
            <div className="flex justify-between items-center mt-4">
              <span className="text-lg font-bold">總計：</span>
              <span className="text-2xl font-extrabold text-gray-900">NT$ {totalAmount.toFixed(0)}</span>
            </div>
          </div>

          {/* 優惠碼提示 */}
          <div className="text-blue-500 text-sm mt-4 mb-2 cursor-pointer hover:underline">有優惠碼嗎？</div>

          {/* 結帳按鈕 */}
          <div className="mt-8">
            <Link
              href="/checkout"
              className="w-full flex justify-center py-3 px-4 text-base font-semibold text-white bg-gray-900 hover:bg-gray-700 transition"
            >
              前往結帳
            </Link>
          </div>
        </>
      )}
      </div>
    </div>
  );
}
