'use client';

import React, { useState } from 'react';
import { HiOutlineUser, HiOutlineMail, HiOutlinePhone, HiOutlineLocationMarker, HiOutlineCreditCard, HiOutlineTruck, HiOutlineShoppingCart } from 'react-icons/hi';
import { useRouter } from 'next/navigation';
import { useCart } from '@/hooks/useCart';

interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: 'credit_card' | 'bank_transfer' | 'cash_on_delivery';
  deliveryMethod: 'standard' | 'express';
}

const CheckoutForm: React.FC = () => {
  const router = useRouter();
  const { cartItems, totalAmount, clearCart } = useCart();
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: 'credit_card',
    deliveryMethod: 'standard',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // 這裡應該呼叫後端 API 進行訂單創建
      // 模擬 API 呼叫
      await new Promise(resolve => setTimeout(resolve, 1000));

      // 清空購物車
      clearCart();
      
      // 跳轉到訂單完成頁面
      router.push('/checkout/success');
    } catch (err) {
      setError('訂單創建失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* 步驟條 */}
        <ol className="flex items-center justify-between w-full mb-8">
          <li className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900 text-white font-bold">1</div>
            <span className="mt-2 text-xs text-gray-700">購物車</span>
          </li>
          <li className="flex-auto h-1 bg-gray-200 mx-2 rounded" />
          <li className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-900 text-white font-bold">2</div>
            <span className="mt-2 text-xs text-gray-700 font-bold">填寫資料</span>
          </li>
          <li className="flex-auto h-1 bg-gray-200 mx-2 rounded" />
          <li className="flex flex-col items-center flex-1">
            <div className="w-8 h-8 rounded-full flex items-center justify-center bg-gray-300 text-white font-bold">3</div>
            <span className="mt-2 text-xs text-gray-400">完成訂單</span>
          </li>
        </ol>
        <h1 className="text-3xl font-extrabold text-gray-900 mb-10 tracking-tight flex items-center gap-2">
          <HiOutlineShoppingCart className="h-7 w-7 text-gray-900" />
          結帳
        </h1>
        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">購物車是空的</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              返回購物車
            </button>
          </div>
        ) : (
          <div>
            <form onSubmit={handleSubmit} className="space-y-10 bg-white rounded-2xl shadow-sm p-8">
              {/* 基本資訊 */}
              <div className="space-y-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <HiOutlineUser className="h-5 w-5 text-gray-400" />
                    收件人姓名
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring-gray-700 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <HiOutlineMail className="h-5 w-5 text-gray-400" />
                    電子郵件
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring-gray-700 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <HiOutlinePhone className="h-5 w-5 text-gray-400" />
                    手機號碼
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring-gray-700 sm:text-sm"
                  />
                </div>

                <div>
                  <label htmlFor="address" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                    <HiOutlineLocationMarker className="h-5 w-5 text-gray-400" />
                    送貨地址
                  </label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    required
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring-gray-700 sm:text-sm"
                  />
                </div>
              </div>

              {/* 付款方式 */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HiOutlineCreditCard className="h-6 w-6 text-gray-800" />
                  付款方式
                </h2>
                <div className="space-y-4">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="credit_card"
                        name="paymentMethod"
                        type="radio"
                        value="credit_card"
                        checked={formData.paymentMethod === 'credit_card'}
                        onChange={handleInputChange}
                        className="focus:ring-gray-700 h-4 w-4 text-gray-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="credit_card" className="font-medium text-gray-700">
                        信用卡付款
                      </label>
                    </div>
                  </div>
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="bank_transfer"
                        name="paymentMethod"
                        type="radio"
                        value="bank_transfer"
                        checked={formData.paymentMethod === 'bank_transfer'}
                        onChange={handleInputChange}
                        className="focus:ring-gray-700 h-4 w-4 text-gray-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="bank_transfer" className="font-medium text-gray-700">
                        銀行轉帳
                      </label>
                    </div>
                  </div>
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="cash_on_delivery"
                        name="paymentMethod"
                        type="radio"
                        value="cash_on_delivery"
                        checked={formData.paymentMethod === 'cash_on_delivery'}
                        onChange={handleInputChange}
                        className="focus:ring-gray-700 h-4 w-4 text-gray-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="cash_on_delivery" className="font-medium text-gray-700">
                        貨到付款
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 運送方式 */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HiOutlineTruck className="h-6 w-6 text-gray-800" />
                  運送方式
                </h2>
                <div className="space-y-4">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="standard"
                        name="deliveryMethod"
                        type="radio"
                        value="standard"
                        checked={formData.deliveryMethod === 'standard'}
                        onChange={handleInputChange}
                        className="focus:ring-gray-700 h-4 w-4 text-gray-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="standard" className="font-medium text-gray-700">
                        標準運送
                      </label>
                    </div>
                  </div>
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="express"
                        name="deliveryMethod"
                        type="radio"
                        value="express"
                        checked={formData.deliveryMethod === 'express'}
                        onChange={handleInputChange}
                        className="focus:ring-gray-700 h-4 w-4 text-gray-600 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="express" className="font-medium text-gray-700">
                        火速運送
                      </label>
                    </div>
                  </div>
                </div>
              </div>

              {/* 購物車摘要 */}
              <div>
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <HiOutlineShoppingCart className="h-6 w-6 text-gray-800" />
                  購物車摘要
                </h2>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                        <p className="text-sm text-gray-500">數量: {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-gray-900">${item.price * item.quantity}</p>
                    </div>
                  ))}
                  <div className="border-t border-gray-200 pt-4 mt-2">
                    <div className="flex justify-between items-center">
                      <h3 className="text-base font-medium text-gray-900">總計</h3>
                      <p className="text-base font-medium text-gray-900">${totalAmount}</p>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
                收件人姓名
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring-gray-700 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <HiOutlineMail className="h-5 w-5 text-gray-400" />
                電子郵件
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring-gray-700 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <HiOutlinePhone className="h-5 w-5 text-gray-400" />
                手機號碼
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring-gray-700 sm:text-sm"
              />
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-gray-700 flex items-center gap-2">
                <HiOutlineLocationMarker className="h-5 w-5 text-gray-400" />
                送貨地址
              </label>
              <textarea
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                required
                rows={3}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-700 focus:ring-gray-700 sm:text-sm"
              />
            </div>
          </div>

          {/* 付款方式 */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HiOutlineCreditCard className="h-6 w-6 text-gray-800" />
              付款方式
            </h2>
            <div className="space-y-4">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="credit_card"
                    name="paymentMethod"
                    type="radio"
                    value="credit_card"
                    checked={formData.paymentMethod === 'credit_card'}
                    onChange={handleInputChange}
                    className="focus:ring-gray-700 h-4 w-4 text-gray-600 border-gray-300"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="credit_card" className="font-medium text-gray-700">
                    信用卡付款
                  </label>
                </div>
              </div>
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="bank_transfer"
                    name="paymentMethod"
                    type="radio"
                    value="bank_transfer"
                    checked={formData.paymentMethod === 'bank_transfer'}
                    onChange={handleInputChange}
                    className="focus:ring-gray-700 h-4 w-4 text-gray-600 border-gray-300"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="bank_transfer" className="font-medium text-gray-700">
                    銀行轉帳
                  </label>
                </div>
              </div>
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="cash_on_delivery"
                    name="paymentMethod"
                    type="radio"
                    value="cash_on_delivery"
                    checked={formData.paymentMethod === 'cash_on_delivery'}
                    onChange={handleInputChange}
                    className="focus:ring-gray-700 h-4 w-4 text-gray-600 border-gray-300"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="cash_on_delivery" className="font-medium text-gray-700">
                    貨到付款
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 運送方式 */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HiOutlineTruck className="h-6 w-6 text-gray-800" />
              運送方式
            </h2>
            <div className="space-y-4">
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="standard"
                    name="deliveryMethod"
                    type="radio"
                    value="standard"
                    checked={formData.deliveryMethod === 'standard'}
                    onChange={handleInputChange}
                    className="focus:ring-gray-700 h-4 w-4 text-gray-600 border-gray-300"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="standard" className="font-medium text-gray-700">
                    標準運送
                  </label>
                </div>
              </div>
              <div className="relative flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="express"
                    name="deliveryMethod"
                    type="radio"
                    value="express"
                    checked={formData.deliveryMethod === 'express'}
                    onChange={handleInputChange}
                    className="focus:ring-gray-700 h-4 w-4 text-gray-600 border-gray-300"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="express" className="font-medium text-gray-700">
                    火速運送
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* 購物車摘要 */}
          <div>
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <HiOutlineShoppingCart className="h-6 w-6 text-gray-800" />
              購物車摘要
            </h2>
            <div className="space-y-4">
              {cartItems.map((item) => (
                <div key={item.id} className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                    <p className="text-sm text-gray-500">數量: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium text-gray-900">${item.price * item.quantity}</p>
                </div>
              ))}
              <div className="border-t border-gray-200 pt-4 mt-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-medium text-gray-900">總計</h3>
                  <p className="text-base font-medium text-gray-900">${totalAmount}</p>
                </div>
              </div>
            </div>
          </div>

          {/* 提交按鈕 */}
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 rounded-2xl shadow-sm text-base font-bold text-white bg-gray-900 hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '處理中...' : '確認訂單'}
            </button>
            {error && (
              <p className="mt-2 text-sm text-red-600">{error}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutForm;
