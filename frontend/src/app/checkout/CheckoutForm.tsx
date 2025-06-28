'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/CartContext';
import { useOrder } from '@/contexts/OrderContext';
import { PaymentMethod } from '@/types/order';

interface CheckoutFormData {
  name: string;
  email: string;
  phone: string;
  address: string;
  paymentMethod: PaymentMethod;
} 

const CheckoutForm: React.FC = () => {
  const router = useRouter();
  const { cartItems, totalAmount, clearCart } = useCart();
  const { createOrder, isLoading: orderLoading, error: orderError } = useOrder();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    name: '',
    email: '',
    phone: '',
    address: '',
    paymentMethod: PaymentMethod.CREDIT_CARD,
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
      // 驗證購物車
      if (cartItems.length === 0) {
        setError('購物車是空的');
        return;
      }

      // 構建訂單資料
      const orderData = {
        customerInfo: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
        },
        paymentMethod: formData.paymentMethod,
        items: cartItems.map(item => ({
          productId: item.productId || item.id, // 向下兼容舊的購物車項目
          variantId: item.variantId,
          quantity: item.quantity,
        })),
        // 如果是訪客，傳遞 sessionId
        sessionId: !localStorage.getItem('auth-token') ? 'guest-session' : undefined,
      };

      // 創建訂單
      const order = await createOrder(orderData);
      
      if (order) {
        // 清空購物車
        await clearCart();
        
        // 根據付款方式決定下一步
        if (formData.paymentMethod === PaymentMethod.CREDIT_CARD || formData.paymentMethod === PaymentMethod.LINE_PAY) {
          // 跳轉到付款頁面
          router.push(`/checkout/payment?orderId=${order.id}&method=${formData.paymentMethod}`);
        } else {
          // 其他付款方式直接跳轉到成功頁面
          router.push(`/checkout/success?orderNumber=${order.orderNumber}`);
        }
      }
    } catch (err: any) {
      console.error('訂單創建失敗:', err);
      setError(err.response?.data?.message || '訂單創建失敗，請稍後再試。');
    } finally {
      setIsLoading(false);
    }
  };

  const finalError = error || orderError;

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">結帳</h1>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">購物車是空的</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              返回首頁
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 基本資訊 */}
            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  收件人姓名 *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-12 px-3"
                  placeholder="請輸入收件人姓名"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  電子郵件 *
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-12 px-3"
                  placeholder="example@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                  手機號碼 *
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm h-12 px-3"
                  placeholder="09xxxxxxxx"
                />
              </div>

              <div>
                <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                  送貨地址 *
                </label>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-3"
                  placeholder="請輸入完整送貨地址"
                />
              </div>
            </div>

            {/* 付款方式 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">付款方式</h2>
              <div className="space-y-4">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="credit_card"
                      name="paymentMethod"
                      type="radio"
                      value={PaymentMethod.CREDIT_CARD}
                      checked={formData.paymentMethod === PaymentMethod.CREDIT_CARD}
                      onChange={handleInputChange}
                      className="focus:ring-gray-500 h-4 w-4 text-gray-600 border-gray-300"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="credit_card" className="font-medium text-gray-700">
                      信用卡付款
                    </label>
                    <p className="text-gray-500">支援 Visa、MasterCard、JCB</p>
                  </div>
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="line_pay"
                      name="paymentMethod"
                      type="radio"
                      value={PaymentMethod.LINE_PAY}
                      checked={formData.paymentMethod === PaymentMethod.LINE_PAY}
                      onChange={handleInputChange}
                      className="focus:ring-gray-500 h-4 w-4 text-gray-600 border-gray-300"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="line_pay" className="font-medium text-gray-700">
                      LINE Pay
                    </label>
                    <p className="text-gray-500">使用 LINE 進行安全付款</p>
                  </div>
                </div>
              </div>
            </div>

            {/* 購物車摘要 */}
            <div>
              <h2 className="text-lg font-medium text-gray-900 mb-4">購物車摘要</h2>
              <div className="bg-gray-50 rounded-lg p-4 space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                      {item.variantTitle && (
                        <p className="text-sm text-gray-500">規格: {item.variantTitle}</p>
                      )}
                      <p className="text-sm text-gray-500">數量: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">
                        NT$ {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 pt-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-base font-medium text-gray-900">總計</h3>
                    <p className="text-lg font-semibold text-gray-900">
                      NT$ {totalAmount.toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 錯誤訊息 */}
            {finalError && (
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      發生錯誤
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{finalError}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 提交按鈕 */}
            <div>
              <button
                type="submit"
                disabled={isLoading || orderLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading || orderLoading ? '處理中...' : '確認訂單'}
              </button>
              
              <p className="mt-2 text-xs text-gray-500 text-center">
                點擊「確認訂單」即表示您同意我們的服務條款
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;