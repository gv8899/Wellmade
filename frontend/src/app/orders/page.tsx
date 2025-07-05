'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useOrder } from '@/contexts/OrderContext';
import { OrderStatus, PaymentStatus } from '@/types/order';

const OrdersPage: React.FC = () => {
  const router = useRouter();
  const { data: session, status } = useSession();
  const { 
    orders, 
    isLoading, 
    error, 
    getOrders, 
    cancelOrder,
    clearError 
  } = useOrder();

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login?callbackUrl=/orders');
      return;
    }

    getOrders();
  }, [session, status]);

  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        clearError();
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  const handleCancelOrder = async (orderId: string) => {
    if (window.confirm('確定要取消這個訂單嗎？')) {
      await cancelOrder(orderId);
    }
  };

  const getStatusColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case OrderStatus.PROCESSING:
        return 'bg-blue-100 text-blue-800';
      case OrderStatus.PAID:
        return 'bg-green-100 text-green-800';
      case OrderStatus.SHIPPED:
        return 'bg-purple-100 text-purple-800';
      case OrderStatus.DELIVERED:
        return 'bg-green-100 text-green-800';
      case OrderStatus.CANCELLED:
        return 'bg-red-100 text-red-800';
      case OrderStatus.REFUNDED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID:
        return 'bg-green-100 text-green-800';
      case PaymentStatus.PENDING:
        return 'bg-yellow-100 text-yellow-800';
      case PaymentStatus.FAILED:
        return 'bg-red-100 text-red-800';
      case PaymentStatus.REFUNDED:
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING: return '待處理';
      case OrderStatus.PROCESSING: return '處理中';
      case OrderStatus.PAID: return '已付款';
      case OrderStatus.SHIPPED: return '已出貨';
      case OrderStatus.DELIVERED: return '已送達';
      case OrderStatus.CANCELLED: return '已取消';
      case OrderStatus.REFUNDED: return '已退款';
      default: return status;
    }
  };

  const getPaymentStatusText = (status: PaymentStatus) => {
    switch (status) {
      case PaymentStatus.PAID: return '已付款';
      case PaymentStatus.PENDING: return '待付款';
      case PaymentStatus.FAILED: return '付款失敗';
      case PaymentStatus.REFUNDED: return '已退款';
      default: return status;
    }
  };

  if (status === 'loading' || isLoading) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/4 mb-8"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-50 rounded-lg p-6">
                  <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // 已重導向到登入頁面
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">我的訂單</h1>
          <button
            onClick={() => router.push('/')}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)' }}
          >
            繼續購物
          </button>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">載入訂單時發生錯誤</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {orders.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">沒有訂單</h3>
            <p className="mt-1 text-sm text-gray-500">您還沒有任何訂單記錄。</p>
            <div className="mt-6">
              <button
                onClick={() => router.push('/')}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700"
              >
                開始購物
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div key={order.id} className="bg-gray-50 rounded-lg overflow-hidden" style={{ boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05), 0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                <div className="px-6 py-4 border-b border-gray-200 bg-white">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">
                        訂單 #{order.orderNumber}
                      </h3>
                      <p className="mt-1 text-sm text-gray-500">
                        下單時間: {new Date(order.createdAt).toLocaleString('zh-TW')}
                      </p>
                    </div>
                    <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row gap-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                        {getStatusText(order.status)}
                      </span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                        {getPaymentStatusText(order.paymentStatus)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="px-6 py-4">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <div>
                      <dt className="text-sm font-medium text-gray-500">付款方式</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {order.paymentMethod === 'credit_card' ? '信用卡' : 
                         order.paymentMethod === 'line_pay' ? 'LINE Pay' : order.paymentMethod}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">訂單金額</dt>
                      <dd className="mt-1 text-sm text-gray-900 font-semibold">
                        NT$ {order.total.toLocaleString()}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">收件人</dt>
                      <dd className="mt-1 text-sm text-gray-900">{order.customerInfo.name}</dd>
                    </div>
                    <div>
                      <dt className="text-sm font-medium text-gray-500">商品數量</dt>
                      <dd className="mt-1 text-sm text-gray-900">
                        {order.items?.reduce((sum, item) => sum + item.quantity, 0) || 0} 件
                      </dd>
                    </div>
                  </div>

                  {order.items && order.items.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">訂單商品</h4>
                      <div className="space-y-2">
                        {order.items.slice(0, 2).map((item) => (
                          <div key={item.id} className="flex justify-between items-center text-sm">
                            <div className="flex-1">
                              <span className="font-medium text-gray-900">
                                {item.product?.name || `商品 ID: ${item.productId}`}
                              </span>
                              {item.variant?.variantTitle && (
                                <span className="text-gray-500 ml-2">
                                  ({item.variant.variantTitle})
                                </span>
                              )}
                              <span className="text-gray-500 ml-2">× {item.quantity}</span>
                            </div>
                            <span className="font-medium text-gray-900">
                              NT$ {(item.price * item.quantity).toLocaleString()}
                            </span>
                          </div>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-sm text-gray-500">
                            還有 {order.items.length - 2} 項商品...
                          </p>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={() => router.push(`/orders/${order.id}`)}
                      className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                      style={{ boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05), 0 1px 2px rgba(0, 0, 0, 0.1)' }}
                    >
                      查看詳情
                    </button>
                    
                    {(order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING) && (
                      <button
                        onClick={() => handleCancelOrder(order.id)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                        style={{ boxShadow: '0 2px 4px rgba(220, 38, 38, 0.1), 0 1px 2px rgba(220, 38, 38, 0.2)' }}
                      >
                        取消訂單
                      </button>
                    )}
                    
                    {order.paymentStatus === PaymentStatus.PENDING && (
                      <button
                        onClick={() => router.push(`/checkout/payment?orderId=${order.id}&method=${order.paymentMethod}`)}
                        className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700"
                      >
                        繼續付款
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;