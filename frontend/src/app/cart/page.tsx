'use client';
import { useState, useEffect } from 'react';
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
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // 從 localStorage 獲取購物車資料
  useEffect(() => {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
    setIsLoading(false);
  }, []);

  // 更新購物車數量
  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedCart = cartItems.map(item => 
      item.id === id ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // 刪除購物車項目
  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // 計算總金額
  const calculateTotal = () => {
    return cartItems.reduce((total, item) => total + item.price * item.quantity, 0);
  };

  if (isLoading) {
    return <div className="text-center py-16">載入中...</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-14 bg-white rounded-[24px] shadow-sm font-sans">
      <h1 className="text-3xl font-extrabold mb-12 text-center tracking-tight">購物車</h1>

      {cartItems.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 text-lg mb-4">購物車目前是空的</p>
          <Link href="/" className="mt-4 inline-block bg-gray-900 text-white px-7 py-2.5 rounded-[18px] font-bold shadow-sm hover:bg-gray-700 transition">
            繼續購物
          </Link>
        </div>
      ) : (
        <div>
          {/* 購物車項目列表 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-10 mb-14">
            {cartItems.map((item) => (
              <div key={item.id} className="bg-white rounded-[24px] shadow-sm p-8 flex flex-col items-center">
                <div className="flex items-center gap-4">
                  <div className="w-32 h-32 relative mb-4">
                    {item.cover ? (
                      <Image
                        src={item.cover}
                        alt={item.name}
                        fill
                        className="object-cover rounded"
                      />
                    ) : (
                      <div className="w-24 h-24 bg-gray-100 flex items-center justify-center text-gray-400">無圖</div>
                    )}
                  </div>
                  <div className="flex-1 flex flex-col items-center">
                    <h3 className="font-bold text-xl text-gray-900 text-center mb-1 tracking-tight">{item.name}</h3>
                    <p className="text-gray-400 text-base text-center mb-2">${item.price}</p>
                    <div className="flex items-center gap-3 mt-3 justify-center">
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="px-2 py-1 bg-gray-100 rounded text-gray-600"
                      >
                        -
                      </button>
                      <span className="px-4 py-1.5 bg-gray-100 rounded-[12px] font-bold text-gray-900">{item.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="px-2 py-1 bg-gray-100 rounded text-gray-600"
                      >
                        +
                      </button>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="ml-4 text-red-500 hover:text-red-700 font-bold transition rounded-[12px] px-3 py-1.5"
                      >
                        刪除
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 結帳資訊 */}
          <div className="bg-white rounded-[24px] shadow-sm p-8 mt-12">
            {/* 總金額 */}
            <div className="flex justify-between items-center mt-6">
              <div className="text-gray-400 text-lg">總計：</div>
              <div className="text-2xl font-extrabold text-gray-900">${calculateTotal()}</div>
            </div>

            {/* 結帳按鈕 */}
            <div className="mt-10">
              <Link
                href="/checkout"
                className="w-full flex justify-center py-3 px-4 rounded-[18px] shadow-sm text-base font-bold text-white bg-gray-900 hover:bg-gray-700 transition"
              >
                前往結帳
              </Link>
            </div>
          </div>
        </div>
      )}
          </div>
    </div>
  );
}
