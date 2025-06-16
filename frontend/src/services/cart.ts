import axios from 'axios';
import { CartItem } from '@/CartContext';
import { getSession } from 'next-auth/react';

// 統一的 API 基礎 URL - 指向實際後端 API
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003/api';

// 檢查是否處於開發模式 - 在開發模式下我們會提供模擬 API 作為回退
const isDevelopment = process.env.NODE_ENV === 'development';

// 購物車 API 端點定義
const CART_API = {
  GET_CART: '/cart',                 // 獲取當前用戶的購物車
  ADD_ITEM: '/cart/items',           // 添加商品到購物車
  UPDATE_ITEM: '/cart/items',        // 更新購物車商品數量
  REMOVE_ITEM: '/cart/items',        // 從購物車中移除商品
  CLEAR_CART: '/cart',               // 清空購物車
  MERGE_CART: '/cart/merge'          // 合併本地購物車到用戶帳號
};

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

// 添加請求攔截器來處理認證
api.interceptors.request.use(async (config) => {
  try {
    const session = await getSession();
    if (session && (session as any).accessToken) {
      config.headers.Authorization = `Bearer ${(session as any).accessToken}`;
    }
  } catch (error) {
    console.error('獲取會話失敗:', error);
  }
  return config;
});

// API 請求和響應類型定義
export interface CartApiItem {
  id?: string;
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

// 購物車響應類型
export interface CartResponse {
  items: CartItem[];
  total: number;
  count: number;
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
      const session = await getSession();
      // 如果用戶未登入且不在開發模式，傳回本地購物車
      if (!session) {
        return mockGetCart();
      }
      
      const response = await api.get(CART_API.GET_CART);
      return { success: true, data: response.data.items || [] };
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
    // 開發模式下，或者用戶未登入時，使用本地存儲
    try {
      const session = await getSession();
      if (isDevelopment || !session) {
        return mockAddToCart(item);
      }
      
      const response = await api.post(CART_API.ADD_ITEM, item);
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
    try {
      const session = await getSession();
      if (isDevelopment || !session) {
        return mockUpdateQuantity(itemId, quantity);
      }
      
      const response = await api.patch(`${CART_API.UPDATE_ITEM}/${itemId}`, { quantity });
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
    try {
      const session = await getSession();
      if (isDevelopment || !session) {
        return { success: true };
      }
      
      await api.delete(`${CART_API.REMOVE_ITEM}/${itemId}`);
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
    try {
      const session = await getSession();
      if (isDevelopment || !session) {
        return { success: true };
      }
      
      await api.delete(CART_API.CLEAR_CART);
      return { success: true };
    } catch (error) {
      console.error('清空購物車失敗:', error);
      return { success: true }; // 即使 API 失敗也返回成功，前端已進行樂觀更新
    }
  },
  
  /**
   * 合併本地購物車到用戶帳號
   * @param items 本地購物車項目
   */
  mergeCart: async (items: CartItem[]): Promise<ApiResponse<CartItem[]>> => {
    if (items.length === 0) {
      return { success: true, data: [] };
    }
    
    try {
      const session = await getSession();
      if (isDevelopment || !session) {
        return { success: true, data: items };
      }
      
      const response = await api.post(CART_API.MERGE_CART, { items });
      return { success: true, data: response.data.items || [] };
    } catch (error) {
      console.error('合併購物車失敗:', error);
      return { success: false, message: '合併購物車失敗', data: items };
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
