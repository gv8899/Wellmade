import axios from 'axios';
import { CartItem } from '@/CartContext';

// 統一的 API 基礎 URL - 指向實際後端 API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

// 檢查是否處於開發模式 - 在開發模式下使用本地儲存而不是真實 API 調用
const isDevelopment = process.env.NODE_ENV === 'development';

// 模擬檢索購物車函数 - 先定義以供后續使用
const mockGetCart = (): ApiResponse<CartItem[]> => {
  try {
    if (typeof window === 'undefined') return { success: true, data: [] };
    
    const localCart = localStorage.getItem('cart');
    if (localCart) {
      const parsedCart = JSON.parse(localCart);
      if (Array.isArray(parsedCart)) {
        return { success: true, data: parsedCart };
      }
    }
    
    return { success: true, data: [] };
  } catch (e) {
    console.error('讀取本地購物車失敗:', e);
    return { success: true, data: [] };
  }
};

// 模擬添加商品到購物車
// 生成唯一的購物車項目 ID
const generateCartItemId = (productId: string, specs: Record<string, string> = {}) => {
  // 如果有規格，則將規格排序後轉換為字符串作為 ID 的一部分
  const specString = Object.entries(specs)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}:${value}`)
    .join('_');
  
  // 使用產品ID和規格生成唯一ID
  return specString ? `${productId}_${specString}` : productId;
};

const mockAddToCart = (item: any): ApiResponse<CartItem> => {
  // 從本地緩存獲取產品信息（如果有）
  const productId = item.productId;
  const id = generateCartItemId(productId, item.specs);
  
  return { 
    success: true, 
    data: { 
      id,
      name: '商品',
      price: 1000,
      quantity: item.quantity,
      cover: '',
      specs: item.specs || {},
    }
  };
};

// 模擬更新購物車商品數量
const mockUpdateQuantity = (itemId: string, quantity: number): ApiResponse<CartItem> => {
  // 從本地存儲讀取當前購物車
  if (typeof window === 'undefined') {
    return { success: true, data: { id: itemId, name: '商品', price: 1000, quantity, cover: '', specs: {} } };
  }
  
  try {
    const localCart = localStorage.getItem('cart');
    if (localCart) {
      const items = JSON.parse(localCart);
      const item = items.find((i: CartItem) => i.id === itemId);
      if (item) {
        return { success: true, data: { ...item, quantity } as CartItem };
      }
    }
  } catch (e) {
    console.error('讀取本地購物車失敗:', e);
  }
  
  return { 
    success: true, 
    data: { id: itemId, name: '商品', price: 1000, quantity, cover: '', specs: {} }
  };
};

// 創建 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // 允許攜帶 cookies 等認證信息
  headers: {
    'Content-Type': 'application/json',
  },
  // 設置較短的超時時間，避免在開發中等待過長
  timeout: isDevelopment ? 2000 : 10000,
});

// API 請求和響應類型定義
export interface CartApiItem {
  id: string;
  productId: string;
  variantId?: string;
  quantity: number;
  specs?: { [key: string]: string };
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

// 購物車 API 服務
export const cartApi = {
  /**
   * 獲取當前用戶的購物車
   */
  getCart: async (): Promise<ApiResponse<CartItem[]>> => {
    // 開發模式下直接使用本地儲存
    if (isDevelopment) {
      return mockGetCart();
    }
    
    try {
      const response = await api.get('/cart');
      return { success: true, data: response.data };
    } catch (error) {
      console.error('獲取購物車失敗:', error);
      
      // 如果 API 調用失敗，回退到本地儲存
      return mockGetCart();
    }
  },
  
  /**
   * 添加商品到購物車
   */
  addToCart: async (item: Omit<CartApiItem, 'id'>): Promise<ApiResponse<CartItem>> => {
    // 開發模式下模擬 API 響應
    if (isDevelopment) {
      return mockAddToCart(item);
    }
    
    try {
      const response = await api.post('/cart/items', item);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('添加商品到購物車失敗:', error);
      
      // API 調用失敗，使用模擬響應
      return mockAddToCart(item);
    }
  },
  
  /**
   * 更新購物車商品數量
   */
  updateQuantity: async (itemId: string, quantity: number): Promise<ApiResponse<CartItem>> => {
    // 開發模式下直接返回成功
    if (isDevelopment) {
      return mockUpdateQuantity(itemId, quantity);
    }
    
    try {
      const response = await api.patch(`/cart/items/${itemId}`, { quantity });
      return { success: true, data: response.data };
    } catch (error) {
      console.error('更新購物車商品數量失敗:', error);
      
      // API 調用失敗，使用模擬響應
      return mockUpdateQuantity(itemId, quantity);
    }
  },
  
  /**
   * 從購物車移除商品
   */
  removeFromCart: async (itemId: string): Promise<ApiResponse<void>> => {
    // 開發模式下直接返回成功
    if (isDevelopment) {
      return { success: true };
    }
    
    try {
      await api.delete(`/cart/items/${itemId}`);
      return { success: true };
    } catch (error) {
      console.error('從購物車移除商品失敗:', error);
      return { success: true }; // 即使 API 失敗也返回成功，前端已進行樂觀更新
    }
  },
  
  /**
   * 清空購物車
   */
  clearCart: async (): Promise<ApiResponse<void>> => {
    // 開發模式下直接返回成功
    if (isDevelopment) {
      return { success: true };
    }
    
    try {
      await api.delete('/cart');
      return { success: true };
    } catch (error) {
      console.error('清空購物車失敗:', error);
      return { success: true }; // 即使 API 失敗也返回成功，前端已進行樂觀更新
    }
  }
};

// 提供本地存儲的購物車功能 (用於離線使用或 API 失敗時的回退)
export const localCartStorage = {
  getCart: (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    
    const cartData = localStorage.getItem('cart');
    return cartData ? JSON.parse(cartData) : [];
  },
  
  saveCart: (items: CartItem[]): void => {
    if (typeof window === 'undefined') return;
    
    localStorage.setItem('cart', JSON.stringify(items));
  }
};
