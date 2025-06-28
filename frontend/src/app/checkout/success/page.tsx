'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useOrder } from '@/contexts/OrderContext';
import { Order } from '@/types/order';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { getOrderByNumber, currentOrder } = useOrder();
  
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const orderNumber = searchParams.get('orderNumber');
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setIsLoading(true);
        
        if (orderNumber) {
          const orderData = await getOrderByNumber(orderNumber);
          setOrder(orderData);
        } else if (orderId && currentOrder?.id === orderId) {
          setOrder(currentOrder);
        }
      } catch (error) {
        console.error('載入訂單失敗:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (orderNumber || (orderId && currentOrder)) {
      loadOrder();
    } else {
      setIsLoading(false);
    }
  }, [orderNumber, orderId, currentOrder]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">載入訂單資訊中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">訂單已完成！</h1>
          <p className="text-gray-600">感謝您的購買，我們會盡快處理您的訂單。</p>
        </div>

        {order && (
          <div className="bg-gray-50 rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 mb-4">訂單詳情</h2>
            
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">訂單編號</span>
                <span className="font-medium text-gray-900">{order.orderNumber}</span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">訂單狀態</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                  {order.status === 'pending' ? '處理中' : order.status}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">付款狀態</span>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  order.paymentStatus === 'paid' 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-yellow-100 text-yellow-800'
                }`}>
                  {order.paymentStatus === 'paid' ? '已付款' : 
                   order.paymentStatus === 'pending' ? '待付款' : order.paymentStatus}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">付款方式</span>
                <span className="font-medium text-gray-900">
                  {order.paymentMethod === 'credit_card' ? '信用卡' : 
                   order.paymentMethod === 'line_pay' ? 'LINE Pay' : order.paymentMethod}
                </span>
              </div>
              
              <div className="flex justify-between">
                <span className="text-gray-600">訂單金額</span>
                <span className="font-medium text-gray-900">NT$ {order.total.toLocaleString()}</span>
              </div>
              
              <div className="border-t border-gray-200 pt-3">
                <span className="text-gray-600 block mb-2">收件資訊</span>
                <div className="text-sm text-gray-900">
                  <p>{order.customerInfo.name}</p>
                  <p>{order.customerInfo.phone}</p>
                  <p>{order.customerInfo.email}</p>
                  <p>{order.customerInfo.address}</p>
                </div>
              </div>
            </div>

            {order.items && order.items.length > 0 && (
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">訂單商品</h3>
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-sm">
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">
                          {item.product?.name || `商品 ID: ${item.productId}`}
                        </p>
                        {item.variant?.variantTitle && (
                          <p className="text-gray-500">規格: {item.variant.variantTitle}</p>
                        )}
                        <p className="text-gray-500">數量: {item.quantity}</p>
                      </div>
                      <p className="font-medium text-gray-900">
                        NT$ {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push('/')} 
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            繼續購物
          </button>

          <button
            onClick={() => router.push('/orders')} 
            className="flex-1 sm:flex-none inline-flex items-center justify-center px-6 py-3 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
          >
            查看所有訂單
          </button>
        </div>

        {order?.paymentStatus === 'pending' && (
          <div className="mt-6 p-4 bg-yellow-50 rounded-md">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  付款尚未完成
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>您的訂單已建立，但付款尚未完成。請完成付款以確保訂單能夠正常處理。</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}