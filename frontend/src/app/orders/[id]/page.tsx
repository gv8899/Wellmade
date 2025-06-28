'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useOrder } from '@/contexts/OrderContext';
import { Order, OrderStatus, PaymentStatus } from '@/types/order';

const OrderDetailPage: React.FC = () => {
  const router = useRouter();
  const params = useParams();
  const { data: session, status } = useSession();
  const { 
    currentOrder, 
    isLoading, 
    error, 
    getOrder, 
    cancelOrder 
  } = useOrder();

  const [order, setOrder] = useState<Order | null>(null);
  const orderId = params.id as string;

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push(`/auth/login?callbackUrl=/orders/${orderId}`);
      return;
    }

    if (orderId) {
      loadOrder();
    }
  }, [session, status, orderId]);

  useEffect(() => {
    if (currentOrder && currentOrder.id === orderId) {
      setOrder(currentOrder);
    }
  }, [currentOrder, orderId]);

  const loadOrder = async () => {
    try {
      const orderData = await getOrder(orderId);
      setOrder(orderData);
    } catch (error) {
      console.error('載入訂單詳情失敗:', error);
    }
  };

  const handleCancelOrder = async () => {
    if (!order) return;
    
    if (window.confirm('確定要取消這個訂單嗎？此操作無法復原。')) {
      await cancelOrder(order.id);
      await loadOrder(); // 重新載入訂單
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
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-8"></div>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="h-6 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!session) {
    return null; // 已重導向到登入頁面
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="rounded-md bg-red-50 p-4 mb-6">
            <h1 className="text-lg font-medium text-red-800 mb-2">載入訂單失敗</h1>
            <p className="text-sm text-red-700">{error}</p>
          </div>
          <button
            onClick={() => router.push('/orders')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            返回訂單列表
          </button>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">找不到訂單</h1>
          <p className="text-gray-600 mb-6">請檢查訂單編號是否正確</p>
          <button
            onClick={() => router.push('/orders')}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            返回訂單列表
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">訂單詳情</h1>
            <p className="mt-1 text-sm text-gray-500">訂單編號: {order.orderNumber}</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-2">
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
              {getStatusText(order.status)}
            </span>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
              {getPaymentStatusText(order.paymentStatus)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要內容 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 訂單商品 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">訂單商品</h2>
              </div>
              <div className="px-6 py-4">
                {order.items && order.items.length > 0 ? (
                  <div className="space-y-4">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md"></div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-gray-900">
                            {item.product?.name || `商品 ID: ${item.productId}`}
                          </h4>
                          {item.variant?.variantTitle && (
                            <p className="text-sm text-gray-500">規格: {item.variant.variantTitle}</p>
                          )}
                          <p className="text-sm text-gray-500">數量: {item.quantity}</p>
                          {item.specs && Object.keys(item.specs).length > 0 && (
                            <div className="text-xs text-gray-400">
                              {Object.entries(item.specs).map(([key, value]) => (
                                <span key={key} className="mr-2">{key}: {value}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium text-gray-900">
                            NT$ {(item.price * item.quantity).toLocaleString()}
                          </p>
                          <p className="text-xs text-gray-500">
                            單價: NT$ {item.price.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">沒有商品資訊</p>
                )}
              </div>
            </div>

            {/* 訂單進度 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">訂單進度</h2>
              </div>
              <div className="px-6 py-4">
                <div className="flow-root">
                  <ul className="-mb-8">
                    <li>
                      <div className="relative pb-8">
                        <div className="relative flex space-x-3">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-8 ring-white">
                            <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                          <div className="min-w-0 flex-1">
                            <div>
                              <p className="text-sm text-gray-900">訂單已建立</p>
                              <p className="text-xs text-gray-500">
                                {new Date(order.createdAt).toLocaleString('zh-TW')}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                    
                    {order.paymentStatus === PaymentStatus.PAID && (
                      <li>
                        <div className="relative pb-8">
                          <div className="relative flex space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-green-500 ring-8 ring-white">
                              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <p className="text-sm text-gray-900">付款完成</p>
                                <p className="text-xs text-gray-500">訂單已收到款項</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )}

                    {order.status === OrderStatus.PROCESSING && (
                      <li>
                        <div className="relative pb-8">
                          <div className="relative flex space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-500 ring-8 ring-white">
                              <div className="h-2 w-2 rounded-full bg-white"></div>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <p className="text-sm text-gray-900">訂單處理中</p>
                                <p className="text-xs text-gray-500">正在準備您的商品</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )}

                    {order.status === OrderStatus.SHIPPED && (
                      <li>
                        <div className="relative">
                          <div className="relative flex space-x-3">
                            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500 ring-8 ring-white">
                              <svg className="h-5 w-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M8 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM15 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
                                <path d="M3 4a1 1 0 00-1 1v10a1 1 0 001 1h1.05a2.5 2.5 0 014.9 0H10a1 1 0 001-1V5a1 1 0 00-1-1H3zM14 7a1 1 0 00-1 1v6.05A2.5 2.5 0 0115.95 16H17a1 1 0 001-1v-5a1 1 0 00-.293-.707L16 7.586A1 1 0 0015.414 7H14z" />
                              </svg>
                            </div>
                            <div className="min-w-0 flex-1">
                              <div>
                                <p className="text-sm text-gray-900">商品已出貨</p>
                                <p className="text-xs text-gray-500">商品正在配送中</p>
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* 側邊欄 */}
          <div className="space-y-6">
            {/* 訂單摘要 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">訂單摘要</h2>
              </div>
              <div className="px-6 py-4 space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">小計</span>
                  <span className="text-sm text-gray-900">NT$ {order.subtotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">運費</span>
                  <span className="text-sm text-gray-900">NT$ {order.shippingFee.toLocaleString()}</span>
                </div>
                <div className="border-t border-gray-200 pt-4 flex justify-between">
                  <span className="text-base font-medium text-gray-900">總計</span>
                  <span className="text-base font-medium text-gray-900">NT$ {order.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* 收件資訊 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">收件資訊</h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">收件人:</span> {order.customerInfo.name}</p>
                  <p><span className="font-medium">電話:</span> {order.customerInfo.phone}</p>
                  <p><span className="font-medium">電子郵件:</span> {order.customerInfo.email}</p>
                  <p><span className="font-medium">地址:</span> {order.customerInfo.address}</p>
                </div>
              </div>
            </div>

            {/* 付款資訊 */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                <h2 className="text-lg font-medium text-gray-900">付款資訊</h2>
              </div>
              <div className="px-6 py-4">
                <div className="space-y-2 text-sm">
                  <p>
                    <span className="font-medium">付款方式:</span> 
                    {order.paymentMethod === 'credit_card' ? ' 信用卡' : 
                     order.paymentMethod === 'line_pay' ? ' LINE Pay' : ` ${order.paymentMethod}`}
                  </p>
                  <p>
                    <span className="font-medium">付款狀態:</span> 
                    <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${getPaymentStatusColor(order.paymentStatus)}`}>
                      {getPaymentStatusText(order.paymentStatus)}
                    </span>
                  </p>
                </div>
              </div>
            </div>

            {/* 操作按鈕 */}
            <div className="space-y-3">
              <button
                onClick={() => router.push('/orders')}
                className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                返回訂單列表
              </button>
              
              {order.paymentStatus === PaymentStatus.PENDING && (
                <button
                  onClick={() => router.push(`/checkout/payment?orderId=${order.id}&method=${order.paymentMethod}`)}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-700"
                >
                  繼續付款
                </button>
              )}
              
              {(order.status === OrderStatus.PENDING || order.status === OrderStatus.PROCESSING) && (
                <button
                  onClick={handleCancelOrder}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
                >
                  取消訂單
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailPage;