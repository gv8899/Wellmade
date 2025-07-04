'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/CartContext';
import { useOrder } from '@/contexts/OrderContext';
import { PaymentMethod } from '@/types/order';

// 🎯 導入設計系統
import { Text, Button, FormField } from '@/design-system';
import { colors } from '@/design-system';
import type { ColorMode } from '@/design-system';

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
  const [colorMode, setColorMode] = useState<ColorMode>('light');
  
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
        <Text variant="largeTitle" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'bold', marginBottom: '2rem' }}>
          結帳
        </Text>

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <Text variant="headline" color={colors.neutral.secondaryLabel} colorMode={colorMode} style={{ marginBottom: '1rem' }}>
              購物車是空的
            </Text>
            <Button
              variant="secondary"
              size="medium"
              colorMode={colorMode}
              onClick={() => router.push('/')}
            >
              返回首頁
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* 基本資訊 */}
            <div className="space-y-6">
              <FormField
                label="收件人姓名 *"
                name="name"
                type="text"
                placeholder="請輸入收件人姓名"
                value={formData.name}
                onChange={handleInputChange}
                required
                colorMode={colorMode}
              />

              <FormField
                label="電子郵件 *"
                name="email"
                type="email"
                placeholder="example@email.com"
                value={formData.email}
                onChange={handleInputChange}
                required
                colorMode={colorMode}
              />

              <FormField
                label="手機號碼 *"
                name="phone"
                type="tel"
                placeholder="09xxxxxxxx"
                value={formData.phone}
                onChange={handleInputChange}
                required
                colorMode={colorMode}
              />

              <div>
                <Text variant="subhead" color={colors.neutral.label} colorMode={colorMode} style={{ display: 'block', fontWeight: 'medium', marginBottom: '0.25rem' }}>
                  送貨地址 *
                </Text>
                <textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  required
                  rows={3}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-gray-500 focus:ring-gray-500 sm:text-sm p-3"
                  placeholder="請輸入完整送貨地址"
                  style={{
                    borderColor: colors.neutral.tertiaryLabel.light,
                    focusBorderColor: colors.primary.light
                  }}
                />
              </div>
            </div>

            {/* 付款方式 */}
            <div>
              <Text variant="title3" color={colors.neutral.label} colorMode={colorMode} style={{ fontWeight: 'medium', marginBottom: '1rem' }}>
                付款方式
              </Text>
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
              <div className="rounded-md p-4" style={{ backgroundColor: `${colors.danger.light}10` }}>
                <Text variant="subhead" color={colors.danger} colorMode={colorMode} style={{ fontWeight: 'medium', marginBottom: '0.5rem' }}>
                  發生錯誤
                </Text>
                <Text variant="subhead" color={colors.danger} colorMode={colorMode}>
                  {finalError}
                </Text>
              </div>
            )}

            {/* 提交按鈕 */}
            <div>
              <Button
                type="submit"
                variant="primary"
                size="large"
                colorMode={colorMode}
                disabled={isLoading || orderLoading}
                style={{ width: '100%' }}
              >
                {isLoading || orderLoading ? '處理中...' : '確認訂單'}
              </Button>
              
              <Text variant="footnote" color={colors.neutral.tertiaryLabel} colorMode={colorMode} style={{ marginTop: '0.5rem', textAlign: 'center' }}>
                點擊「確認訂單」即表示您同意我們的服務條款
              </Text>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CheckoutForm;