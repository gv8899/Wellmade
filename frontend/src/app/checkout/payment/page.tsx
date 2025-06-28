'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOrder } from '@/contexts/OrderContext';
import { createPayment } from '@/services/orders';
import { PaymentMethod } from '@/types/order';

const PaymentPage: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const formRef = useRef<HTMLFormElement>(null);
  
  const orderId = searchParams.get('orderId');
  const paymentMethod = searchParams.get('method') as PaymentMethod;
  
  const { getOrder, currentOrder, checkPaymentTimeout, retryPayment } = useOrder();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [isRetrying, setIsRetrying] = useState(false);

  useEffect(() => {
    if (!orderId || !paymentMethod) {
      setError('缺少必要的付款參數');
      setIsLoading(false);
      return;
    }

    initializePayment();
  }, [orderId, paymentMethod]);

  const initializePayment = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // 獲取訂單資訊
      const order = await getOrder(orderId!);
      if (!order) {
        throw new Error('找不到訂單');
      }

      // 檢查付款是否已超時
      const timeoutResult = await checkPaymentTimeout(orderId!);
      if (timeoutResult?.isTimeout) {
        setError('付款已逾時，請重新付款');
        return;
      }

      // 創建付款
      const paymentResponse = await createPayment({
        orderId: orderId!,
        paymentMethod: paymentMethod!,
      });

      setPaymentData(paymentResponse);

      // 自動提交表單到藍新金流
      setTimeout(() => {
        if (formRef.current) {
          formRef.current.submit();
        }
      }, 1000);

    } catch (err: any) {
      console.error('初始化付款失敗:', err);
      let errorMessage = '付款初始化失敗';
      
      // 根據錯誤狀態碼提供更友善的錯誤訊息
      if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || '付款參數錯誤';
      } else if (err.response?.status === 404) {
        errorMessage = '找不到訂單';
      } else if (err.response?.status >= 500) {
        errorMessage = '伺服器繁忙，請稍後再試';
      }
      
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRetryPayment = async () => {
    if (!orderId || !paymentMethod) return;
    
    setIsRetrying(true);
    try {
      const success = await retryPayment(orderId, paymentMethod);
      if (!success) {
        setError('重試付款失敗，請稍後再試');
      }
    } catch (err) {
      setError('重試付款失敗，請稍後再試');
    } finally {
      setIsRetrying(false);
    }
  };

  const handleBackToOrder = () => {
    router.push('/checkout');
  };

  if (!orderId || !paymentMethod) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">付款參數錯誤</h1>
          <p className="text-gray-600 mb-6">缺少必要的付款資訊</p>
          <button
            onClick={() => router.push('/checkout')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            返回結帳頁面
          </button>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <h1 className="text-lg font-medium text-red-800 mb-2">付款失敗</h1>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleBackToOrder}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              返回結帳頁面
            </button>
            <button
              onClick={handleRetryPayment}
              disabled={isRetrying}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400"
            >
              {isRetrying ? '重試中...' : '重試付款'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto text-center">
        {isLoading ? (
          <div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">正在處理付款</h1>
            <p className="text-gray-600">請稍候，正在為您準備付款頁面...</p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">跳轉至付款頁面</h1>
            <p className="text-gray-600 mb-6">
              即將跳轉至{paymentMethod === PaymentMethod.CREDIT_CARD ? '信用卡' : 'LINE Pay'}付款頁面
            </p>
            
            {currentOrder && (
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <h3 className="font-medium text-gray-900 mb-2">訂單資訊</h3>
                <p className="text-sm text-gray-600">訂單編號: {currentOrder.orderNumber}</p>
                <p className="text-sm text-gray-600">
                  付款金額: NT$ {currentOrder.total.toLocaleString()}
                </p>
              </div>
            )}

            {paymentData && (
              <form
                ref={formRef}
                method="POST"
                action={paymentData.apiUrl}
                className="hidden"
              >
                <input type="hidden" name="MerchantID" value={paymentData.paymentData.MerchantID} />
                <input type="hidden" name="TradeInfo" value={paymentData.paymentData.TradeInfo} />
                <input type="hidden" name="TradeSha" value={paymentData.paymentData.TradeSha} />
                <input type="hidden" name="Version" value={paymentData.paymentData.Version} />
              </form>
            )}

            <div className="flex space-x-4 justify-center">
              <button
                onClick={handleBackToOrder}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                返回結帳
              </button>
              
              {paymentData && (
                <button
                  onClick={() => formRef.current?.submit()}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700"
                >
                  前往付款
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentPage;