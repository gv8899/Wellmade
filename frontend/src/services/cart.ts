import axios from 'axios';
import { CartItem } from '@/CartContext';

// 定義一個相容的介面，不將其繼承自 CartItem
export interface CartItemType {
  id: string;
  quantity: number;
  specs: { [key: string]: string };
  // 可能需要的其他屬性
  product?: any;
  variant?: any;
}
import { getSession } from 'next-auth/react';

// 統一的 API 基礎 URL - 使用 Next.js API 路由作為代理
// 這樣可以避免 CORS 和認證問題
const API_BASE_URL = '/api';

// 檢查是否處於開發模式 - 在開發模式下我們會提供模擬 API 作為回退
const isDevelopment = false; // process.env.NODE_ENV === 'development';

// 直接呼叫後端 API，不經過 Next.js API 路由
const CART_API = {
  GET_CART: '/cart',                     // 獲取當前用戶的購物車
  ADD_ITEM: '/cart/items',               // 添加商品到購物車
  UPDATE_ITEM: '/cart/items',            // 更新購物車商品數量
  REMOVE_ITEM: '/cart/items',            // 從購物車中移除商品
  CLEAR_CART: '/cart',                   // 清空購物車
  MERGE_CART: '/cart/merge'              // 合併本地購物車到用戶帳號
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
  baseURL: API_BASE_URL,  // 使用基礎 URL 對應到前端服務器
  withCredentials: true, // 允許攜帶 cookies 等認證信息
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // 設定適當的超時時間
  timeout: 10000,
});

// 添加更詳細的請求記錄和連続狀態追蹤

// 請求攝截器 - 添加授權標頭和詳細日誌
api.interceptors.request.use(async (config) => {
  console.log(`準備發送請求到: ${config.url}`, { 
    method: config.method, 
    headers: config.headers,
    data: config.data
  });
  
  try {
    // 添加授權標頭
    const session = await getSession();
    if (session && (session as any).backendToken) {
      config.headers.Authorization = `Bearer ${(session as any).backendToken}`;
      console.log('添加授權標頭到請求');
    }
    
    console.log('當前用戶會話詳細信息:', { 
      hasSession: !!session, 
      hasBackendToken: !!(session && (session as any).backendToken),
      provider: (session as any)?.provider,
      email: session?.user?.email,
      sessionKeys: session ? Object.keys(session) : [],
      backendTokenLength: (session as any)?.backendToken?.length || 0
    });
  } catch (error) {
    console.error('獲取會話時發生錯誤:', error);
  }
  return config;
});

// 響應攝截器 - 改善錯誤處理和記錄
api.interceptors.response.use(
  (response) => {
    console.log(`請求成功: ${response.config.url}`, {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });
    return response;
  },
  (error) => {
    const url = error.config?.url || '未知路徑';
    console.error(`請求失敗: ${url}`, {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data
    });
    
    // 加強錯誤訊息以便於調試
    const enhancedError = error;
    enhancedError.friendlyMessage = `請求失敗: ${url} ${error.message}`;
    return Promise.reject(enhancedError);
  }
);

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
  error?: string;
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
   * 獲取購物車
   */
  getCart: async (): Promise<ApiResponse<CartItem[]>> => {
    try {
      console.log('發送獲取購物車請求到後端:', CART_API.GET_CART);
      const response = await api.get(CART_API.GET_CART);
      console.log('獲取購物車成功:', response.data);
      
      // 處理後端返回的購物車數據
      const cartItems = response.data.items || [];
      return { success: true, data: cartItems };
    } catch (error) {
      console.error('獲取購物車失敗:', error);
      // 發生錯誤時降級到本地購物車
      console.log('降級使用本地購物車');
      return mockGetCart();
    }
  },
  
  /**
   * 添加商品到購物車
   */
  addToCart: async (item: Omit<CartApiItem, 'id'>): Promise<ApiResponse<CartItem>> => {
    try {
      console.log('發送添加購物車請求到後端 API:', {
        url: CART_API.ADD_ITEM,
        item
      });
      
      const response = await api.post(CART_API.ADD_ITEM, item);
      console.log('API 添加購物車響應:', response.data);
      
      // 處理後端返回的購物車數據
      const cartData = response.data;
      const addedItem = cartData.items?.[cartData.items.length - 1] || cartData;
      
      return { success: true, data: addedItem };
    } catch (error) {
      console.error('添加商品到購物車失敗:', error);
      // API 調用失敗，使用模擬響應
      console.log('降級為使用本地儲存');
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
   * 合併本地購物車到用戶帳戶
   */
  mergeCart: async (localCart: CartItem[]): Promise<ApiResponse<CartItem[]>> => {
    try {
      // 如果本地購物車為空，則直接獲取用戶的購物車
      if (localCart.length === 0) {
        console.log('本地購物車為空，直接獲取後端購物車');
        const cartResponse = await api.get(CART_API.GET_CART);
        return { success: true, data: cartResponse.data.items || [] };
      }

      // 發送合併請求到後端 API
      console.log('發送合併購物車請求:', {
        url: CART_API.MERGE_CART,
        itemCount: localCart.length,
        items: localCart.map(item => ({
          productId: item.id, // 使用 CartItem 的 id 作為 productId
          quantity: item.quantity,
          specs: item.specs
        }))
      });
      
      const response = await api.post(CART_API.MERGE_CART, { 
        items: localCart.map(item => ({
          productId: item.id, // 使用 CartItem 的 id 作為 productId
          quantity: item.quantity,
          specs: item.specs
        }))
      });
      
      console.log('合併購物車成功:', response.data);
      return { success: true, data: response.data.items || [] };
    } catch (error) {
      console.error('合併購物車失敗:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : '合併購物車失敗' 
      };
    }
  },
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
