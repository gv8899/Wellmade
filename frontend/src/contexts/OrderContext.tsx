'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';
import { Order, CreateOrderData } from '@/types/order';
import * as orderService from '@/services/orders';

interface OrderContextValue {
  // 狀態
  currentOrder: Order | null;
  orders: Order[];
  isLoading: boolean;
  error: string | null;

  // 方法
  createOrder: (orderData: CreateOrderData) => Promise<Order | null>;
  getOrders: () => Promise<void>;
  getOrder: (orderId: string) => Promise<Order | null>;
  getOrderByNumber: (orderNumber: string) => Promise<Order | null>;
  cancelOrder: (orderId: string) => Promise<void>;
  retryPayment: (orderId: string, paymentMethod: string) => Promise<boolean>;
  checkPaymentTimeout: (orderId: string) => Promise<{ isTimeout: boolean; message: string } | null>;
  cancelPayment: (orderId: string) => Promise<boolean>;
  clearCurrentOrder: () => void;
  clearError: () => void;
}

const OrderContext = createContext<OrderContextValue | undefined>(undefined);

export const useOrder = () => {
  const context = useContext(OrderContext);
  if (!context) {
    throw new Error('useOrder must be used within an OrderProvider');
  }
  return context;
};

export const OrderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: session } = useSession();
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearCurrentOrder = useCallback(() => {
    setCurrentOrder(null);
  }, []);

  /**
   * 創建訂單
   */
  const createOrder = useCallback(async (orderData: CreateOrderData): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const order = await orderService.createOrder(orderData);
      setCurrentOrder(order);
      
      // 如果用戶已登入，更新訂單列表
      if (session?.user) {
        await getOrders();
      }

      toast.success(`訂單 #${order.orderNumber} 創建成功！`);
      return order;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '創建訂單失敗，請稍後再試';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  /**
   * 獲取用戶訂單列表
   */
  const getOrders = useCallback(async (): Promise<void> => {
    if (!session?.user) return;

    setIsLoading(true);
    setError(null);

    try {
      const orderList = await orderService.getOrders();
      setOrders(orderList);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '獲取訂單列表失敗';
      setError(errorMessage);
      console.error('獲取訂單列表失敗:', error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  /**
   * 根據 ID 獲取訂單
   */
  const getOrder = useCallback(async (orderId: string): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const order = await orderService.getOrder(orderId);
      setCurrentOrder(order);
      return order;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '獲取訂單詳情失敗';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 根據訂單號碼獲取訂單
   */
  const getOrderByNumber = useCallback(async (orderNumber: string): Promise<Order | null> => {
    setIsLoading(true);
    setError(null);

    try {
      const order = await orderService.getOrderByNumber(orderNumber);
      setCurrentOrder(order);
      return order;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '找不到指定的訂單';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * 取消訂單
   */
  const cancelOrder = useCallback(async (orderId: string): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const updatedOrder = await orderService.cancelOrder(orderId);
      
      // 更新當前訂單（如果是同一個）
      if (currentOrder?.id === orderId) {
        setCurrentOrder(updatedOrder);
      }

      // 更新訂單列表
      setOrders(prev => 
        prev.map(order => 
          order.id === orderId ? updatedOrder : order
        )
      );

      toast.success('訂單已取消');
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '取消訂單失敗';
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder]);

  const retryPayment = useCallback(async (orderId: string, paymentMethod: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const paymentData = await orderService.retryPayment(orderId, paymentMethod);
      
      // 自動跳轉到付款頁面
      if (paymentData.paymentData && paymentData.apiUrl) {
        const form = document.createElement('form');
        form.method = 'POST';
        form.action = paymentData.apiUrl;
        form.style.display = 'none';

        // 添加付款參數
        Object.entries(paymentData.paymentData).forEach(([key, value]) => {
          const input = document.createElement('input');
          input.type = 'hidden';
          input.name = key;
          input.value = value as string;
          form.appendChild(input);
        });

        document.body.appendChild(form);
        form.submit();
        document.body.removeChild(form);
      }

      toast.success('正在重試付款...');
      return true;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '重試付款失敗';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const checkPaymentTimeout = useCallback(async (orderId: string): Promise<{ isTimeout: boolean; message: string } | null> => {
    try {
      const result = await orderService.checkPaymentTimeout(orderId);
      
      if (result.isTimeout) {
        toast.error('付款已逾時，請重新付款');
      }
      
      return result;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '檢查付款超時失敗';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    }
  }, []);

  const cancelPayment = useCallback(async (orderId: string): Promise<boolean> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await orderService.cancelPayment(orderId);
      
      if (result.success) {
        // 更新當前訂單狀態
        if (currentOrder?.id === orderId) {
          setCurrentOrder(prev => prev ? { ...prev, paymentStatus: 'failed' } : null);
        }

        // 更新訂單列表
        setOrders(prev => 
          prev.map(order => 
            order.id === orderId 
              ? { ...order, paymentStatus: 'failed' } 
              : order
          )
        );

        toast.success('付款已取消');
        return true;
      } else {
        toast.error(result.message || '取消付款失敗');
        return false;
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || '取消付款失敗';
      setError(errorMessage);
      toast.error(errorMessage);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [currentOrder]);

  const value: OrderContextValue = {
    // 狀態
    currentOrder,
    orders,
    isLoading,
    error,

    // 方法
    createOrder,
    getOrders,
    getOrder,
    getOrderByNumber,
    cancelOrder,
    retryPayment,
    checkPaymentTimeout,
    cancelPayment,
    clearCurrentOrder,
    clearError,
  };

  return (
    <OrderContext.Provider value={value}>
      {children}
    </OrderContext.Provider>
  );
};