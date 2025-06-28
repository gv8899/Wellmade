import { api } from './api';
import { 
  Order, 
  CreateOrderData, 
  OrderListResponse,
  PaymentResponse 
} from '@/types/order';

/**
 * 創建訂單
 */
export const createOrder = async (orderData: CreateOrderData): Promise<Order> => {
  try {
    const response = await api.post('/orders', orderData);
    return response.data;
  } catch (error) {
    console.error('創建訂單失敗:', error);
    throw error;
  }
};

/**
 * 獲取用戶訂單列表
 */
export const getOrders = async (): Promise<Order[]> => {
  try {
    const response = await api.get('/orders');
    return response.data;
  } catch (error) {
    console.error('獲取訂單列表失敗:', error);
    throw error;
  }
};

/**
 * 根據 ID 獲取單個訂單
 */
export const getOrder = async (orderId: string): Promise<Order> => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('獲取訂單詳情失敗:', error);
    throw error;
  }
};

/**
 * 根據訂單號碼獲取訂單
 */
export const getOrderByNumber = async (orderNumber: string): Promise<Order> => {
  try {
    const response = await api.get(`/orders/order-number/${orderNumber}`);
    return response.data;
  } catch (error) {
    console.error('根據訂單號碼獲取訂單失敗:', error);
    throw error;
  }
};

/**
 * 取消訂單
 */
export const cancelOrder = async (orderId: string): Promise<Order> => {
  try {
    const response = await api.patch(`/orders/${orderId}/cancel`);
    return response.data;
  } catch (error) {
    console.error('取消訂單失敗:', error);
    throw error;
  }
};

/**
 * 創建付款
 */
export const createPayment = async (paymentData: {
  orderId: string;
  paymentMethod: string;
}): Promise<PaymentResponse> => {
  try {
    const response = await api.post('/payment/create', paymentData);
    return response.data;
  } catch (error) {
    console.error('創建付款失敗:', error);
    throw error;
  }
};

/**
 * 查詢付款狀態
 */
export const getPaymentStatus = async (orderId: string): Promise<{
  orderId: string;
  paymentStatus: string;
  paymentRecords: any[];
}> => {
  try {
    const response = await api.get(`/payment/status/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('查詢付款狀態失敗:', error);
    throw error;
  }
};

/**
 * 重試付款
 */
export const retryPayment = async (orderId: string, paymentMethod: string): Promise<PaymentResponse> => {
  try {
    const response = await api.post('/payment/retry', {
      orderId,
      paymentMethod,
    });
    return response.data;
  } catch (error) {
    console.error('重試付款失敗:', error);
    throw error;
  }
};

/**
 * 檢查付款超時
 */
export const checkPaymentTimeout = async (orderId: string): Promise<{
  isTimeout: boolean;
  message: string;
}> => {
  try {
    const response = await api.get(`/payment/timeout/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('檢查付款超時失敗:', error);
    throw error;
  }
};

/**
 * 取消付款
 */
export const cancelPayment = async (orderId: string): Promise<{
  success: boolean;
  message: string;
}> => {
  try {
    const response = await api.post(`/payment/cancel/${orderId}`);
    return response.data;
  } catch (error) {
    console.error('取消付款失敗:', error);
    throw error;
  }
};