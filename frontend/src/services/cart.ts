import axios, { AxiosError, AxiosRequestConfig } from 'axios';
import { CartItem } from '@/types/cart';
import { consoleLogger } from '@/utils/console-logger';

// 重試配置
interface RetryConfig {
  maxRetries: number;
  retryDelay: number;
  retryCondition?: (error: AxiosError) => boolean;
}

// 預設重試配置
const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxRetries: 3,
  retryDelay: 1000,
  retryCondition: (error: AxiosError) => {
    // 只對網路錯誤和5xx服務器錯誤重試
    return !error.response || (error.response.status >= 500 && error.response.status < 600);
  }
};

// 統一的 API 基礎 URL
const API_BASE_URL = '/api';

// API 狀態追蹤
class ApiHealthChecker {
  private isHealthy = true;
  private lastCheckTime = 0;
  private readonly checkInterval = 30000; // 30秒
  
  async checkHealth(): Promise<boolean> {
    const now = Date.now();
    if (now - this.lastCheckTime < this.checkInterval) {
      return this.isHealthy;
    }
    
    try {
      // 簡單的健康檢查
      await axios.get('/api/health', { timeout: 5000 });
      this.isHealthy = true;
    } catch (error) {
      console.warn('API 健康檢查失敗:', error);
      this.isHealthy = false;
    }
    
    this.lastCheckTime = now;
    return this.isHealthy;
  }
  
  markUnhealthy(): void {
    this.isHealthy = false;
    this.lastCheckTime = Date.now();
  }
}

const apiHealth = new ApiHealthChecker();

// Session 緩存機制
class SessionManager {
  private cachedSession: any = null;
  private cacheTime = 0;
  private readonly cacheExpiry = 5000; // 5秒緩存
  
  async getSession(): Promise<any> {
    const now = Date.now();
    
    // 使用緩存的 session 如果仍然有效
    if (this.cachedSession && (now - this.cacheTime < this.cacheExpiry)) {
      return this.cachedSession;
    }
    
    try {
      // 使用 fetch 而不是 getSession() 避免 SSR 問題
      const response = await fetch('/api/auth/session', {
        credentials: 'include',
        headers: { 'Accept': 'application/json' }
      });
      
      if (response.ok) {
        const session = await response.json();
        this.cachedSession = session;
        this.cacheTime = now;
        return session;
      }
    } catch (error) {
      console.warn('獲取 session 失敗:', error);
    }
    
    return null;
  }
  
  clearCache(): void {
    this.cachedSession = null;
    this.cacheTime = 0;
  }
}

const sessionManager = new SessionManager();

// 重試函數
async function retryRequest<T>(
  requestFn: () => Promise<T>,
  config: RetryConfig = DEFAULT_RETRY_CONFIG
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 0; attempt <= config.maxRetries; attempt++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error as Error;
      
      // 最後一次嘗試，不再重試
      if (attempt === config.maxRetries) {
        break;
      }
      
      // 檢查是否應該重試
      if (config.retryCondition && !config.retryCondition(error as AxiosError)) {
        break;
      }
      
      // 等待後重試
      const delay = config.retryDelay * Math.pow(2, attempt); // 指數退避
      console.log(`請求失敗，${delay}ms 後重試 (${attempt + 1}/${config.maxRetries}):`, error);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError || new Error('Request failed after retries');
}

// 創建 axios 實例
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  timeout: 15000, // 增加超時時間
});

// 請求攔截器 - 改進版本
api.interceptors.request.use(async (config) => {
  console.log(`[API] 準備發送請求: ${config.method?.toUpperCase()} ${config.url}`);
  
  try {
    // 檢查 API 健康狀態
    const isHealthy = await apiHealth.checkHealth();
    if (!isHealthy) {
      console.warn('[API] API 健康檢查失敗，但繼續嘗試請求');
    }
    
    // 添加授權標頭
    const session = await sessionManager.getSession();
    if (session?.backendToken) {
      config.headers.Authorization = `Bearer ${session.backendToken}`;
      console.log('[API] 已添加 JWT 授權標頭');
    } else {
      console.log('[API] 未找到有效的 backendToken');
    }
    
    // 添加請求 ID 用於追蹤
    config.headers['X-Request-ID'] = Math.random().toString(36).substr(2, 9);
    
  } catch (error) {
    console.error('[API] 請求預處理失敗:', error);
  }
  
  return config;
});

// 響應攔截器 - 改進版本
api.interceptors.response.use(
  (response) => {
    const requestId = response.config.headers['X-Request-ID'];
    console.log(`[API] ${requestId} 請求成功: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError) => {
    const requestId = error.config?.headers['X-Request-ID'];
    const url = error.config?.url || '未知';
    
    // 分類錯誤類型
    let errorType = 'UNKNOWN';
    if (error.code === 'ECONNABORTED') {
      errorType = 'TIMEOUT';
    } else if (!error.response) {
      errorType = 'NETWORK';
      apiHealth.markUnhealthy();
    } else if (error.response.status >= 500) {
      errorType = 'SERVER_ERROR';
      apiHealth.markUnhealthy();
    } else if (error.response.status === 401) {
      errorType = 'UNAUTHORIZED';
      sessionManager.clearCache();
    } else if (error.response.status >= 400) {
      errorType = 'CLIENT_ERROR';
    }
    
    console.error(`[API] ${requestId} 請求失敗 [${errorType}]: ${url}`, {
      status: error.response?.status,
      message: error.message,
      data: error.response?.data
    });
    
    // 使用 consoleLogger 記錄 API 錯誤
    consoleLogger.apiCall(
      error.config?.method?.toUpperCase() || 'UNKNOWN',
      url,
      error.response?.status,
      undefined,
      { errorType, requestId, data: error.response?.data }
    );
    
    // 增強錯誤對象
    const enhancedError = error as any;
    enhancedError.errorType = errorType;
    enhancedError.requestId = requestId;
    enhancedError.friendlyMessage = getErrorMessage(error, errorType);
    
    return Promise.reject(enhancedError);
  }
);

// 錯誤訊息生成器
function getErrorMessage(error: AxiosError, errorType: string): string {
  switch (errorType) {
    case 'TIMEOUT':
      return '請求超時，請檢查網路連線';
    case 'NETWORK':
      return '網路連線失敗，請檢查網路設定';
    case 'SERVER_ERROR':
      return '服務器暫時無法使用，請稍後再試';
    case 'UNAUTHORIZED':
      return '認證失效，請重新登入';
    case 'CLIENT_ERROR':
      return (error.response?.data as any)?.message || '請求參數錯誤';
    default:
      return '未知錯誤，請聯絡客服';
  }
}

// API 路由定義
const CART_API = {
  GET_CART: '/cart',
  ADD_ITEM: '/cart/items',
  UPDATE_ITEM: '/cart/items',
  REMOVE_ITEM: '/cart/items',
  CLEAR_CART: '/cart'
};

// API 響應類型
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 購物車項目 API 介面（與後端 DTO 一致）
export interface CartApiItem {
  productId: string;
  variantId?: string;
  quantity: number;
  specs?: Record<string, string>;
}

// 生成唯一的購物車項目 ID（改進版本）
const generateCartItemId = (productId: string, specs: Record<string, string> = {}): string => {
  if (!productId || typeof productId !== 'string') {
    console.error('[CART] 無效的 productId:', productId);
    return `invalid_${Date.now()}`;
  }
  
  // 清理並排序規格
  const cleanSpecs = Object.entries(specs)
    .filter(([key, value]) => key && value && typeof key === 'string' && typeof value === 'string')
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key.trim()}:${value.trim()}`)
    .join('_');
  
  return cleanSpecs ? `${productId}_${cleanSpecs}` : productId;
};


// 購物車 API 服務 - 改進版本
export const cartApi = {
  /**
   * 獲取購物車
   */
  getCart: async (): Promise<ApiResponse<CartItem[]>> => {
    return retryRequest(async () => {
      console.log('[CART] 獲取購物車');
      const response = await api.get(CART_API.GET_CART);
      
      console.log('[CART] 後端原始響應:', response.data);
      
      const cartItems = response.data.items || [];
      console.log(`[CART] 成功獲取 ${cartItems.length} 項商品`);
      console.log('[CART] 商品詳情:', cartItems.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity
      })));
      
      return { success: true, data: cartItems };
    }).catch((error) => {
      console.error('[CART] 獲取購物車失敗:', error.friendlyMessage || error.message);
      return {
        success: false,
        error: error.friendlyMessage || '獲取購物車失敗'
      };
    });
  },

  /**
   * 添加商品到購物車
   */
  addToCart: async (item: CartApiItem): Promise<ApiResponse<CartItem>> => {
    return retryRequest(async () => {
      console.log(`[CART] 添加商品: ${item.productId} x${item.quantity}`);
      
      // 只傳遞後端需要的字段
      const requestData = {
        productId: item.productId,
        quantity: item.quantity,
        ...(item.variantId && { variantId: item.variantId }),
        ...(item.specs && { specs: item.specs })
      };
      
      const response = await api.post(CART_API.ADD_ITEM, requestData);
      
      const cartData = response.data;
      const addedItem = cartData.items?.[cartData.items.length - 1] || cartData;
      
      console.log(`[CART] 成功添加商品: ${addedItem.id}`);
      return { success: true, data: addedItem };
    }, {
      ...DEFAULT_RETRY_CONFIG,
      maxRetries: 2 // 添加操作減少重試次數
    }).catch((error) => {
      console.error('[CART] 添加商品失敗:', error.friendlyMessage || error.message);
      return {
        success: false,
        error: error.friendlyMessage || '添加商品失敗'
      };
    });
  },

  /**
   * 更新購物車商品數量
   */
  updateQuantity: async (itemId: string, quantity: number): Promise<ApiResponse<CartItem>> => {
    return retryRequest(async () => {
      console.log(`[CART] 更新商品數量: ${itemId} -> ${quantity}`);
      const response = await api.patch(`${CART_API.UPDATE_ITEM}/${itemId}`, { quantity });
      
      console.log(`[CART] 成功更新商品數量: ${itemId}`);
      return { success: true, data: response.data };
    }).catch((error) => {
      console.error('[CART] 更新數量失敗:', error.friendlyMessage || error.message);
      return {
        success: false,
        error: error.friendlyMessage || '更新數量失敗'
      };
    });
  },

  /**
   * 從購物車移除商品
   */
  removeFromCart: async (itemId: string): Promise<ApiResponse<void>> => {
    return retryRequest(async () => {
      console.log(`[CART] 移除商品: ${itemId}`);
      await api.delete(`${CART_API.REMOVE_ITEM}/${itemId}`);
      
      console.log(`[CART] 成功移除商品: ${itemId}`);
      return { success: true };
    }).catch((error) => {
      console.error('[CART] 移除商品失敗:', error.friendlyMessage || error.message);
      return {
        success: false,
        error: error.friendlyMessage || '移除商品失敗'
      };
    });
  },

  /**
   * 清空購物車
   */
  clearCart: async (): Promise<ApiResponse<void>> => {
    return retryRequest(async () => {
      console.log('[CART] 清空購物車');
      await api.delete(CART_API.CLEAR_CART);
      
      console.log('[CART] 成功清空購物車');
      return { success: true };
    }).catch((error) => {
      console.error('[CART] 清空購物車失敗:', error.friendlyMessage || error.message);
      return {
        success: false,
        error: error.friendlyMessage || '清空購物車失敗'
      };
    });
  },

};

// 提供本地存儲的購物車功能（改進版本）
export const localCartStorage = {
  getCart: (): CartItem[] => {
    if (typeof window === 'undefined') return [];
    
    try {
      const cartData = localStorage.getItem('cart');
      if (!cartData) return [];
      
      const parsed = JSON.parse(cartData);
      if (!Array.isArray(parsed)) {
        console.warn('[LOCAL] 本地購物車格式不正確，重置為空');
        localStorage.removeItem('cart');
        return [];
      }
      
      // 驗證每個項目的基本結構
      const validItems = parsed.filter(item => 
        item && 
        typeof item.id === 'string' &&
        typeof item.quantity === 'number' &&
        item.quantity > 0
      );
      
      if (validItems.length !== parsed.length) {
        console.warn(`[LOCAL] 清理了 ${parsed.length - validItems.length} 項無效商品`);
        localCartStorage.saveCart(validItems);
      }
      
      return validItems;
    } catch (error) {
      console.error('[LOCAL] 讀取本地購物車失敗:', error);
      localStorage.removeItem('cart');
      return [];
    }
  },
  
  saveCart: (items: CartItem[]): void => {
    if (typeof window === 'undefined') return;
    
    try {
      if (!Array.isArray(items)) {
        console.error('[LOCAL] 嘗試保存非陣列數據到購物車');
        return;
      }
      
      // 過濾並清理數據
      const cleanItems = items
        .filter(item => item && item.id && item.quantity > 0)
        .map(item => ({
          id: item.id,
          productId: item.productId || undefined,
          variantId: item.variantId || undefined,
          name: item.name || '',
          price: Number(item.price) || 0,
          quantity: Number(item.quantity) || 1,
          cover: item.cover || '',
          specs: item.specs || {}
        }));
      
      localStorage.setItem('cart', JSON.stringify(cleanItems));
      console.log(`[LOCAL] 已保存 ${cleanItems.length} 項商品到本地`);
    } catch (error) {
      console.error('[LOCAL] 保存本地購物車失敗:', error);
    }
  },
  
  clearCart: (): void => {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.removeItem('cart');
      console.log('[LOCAL] 已清空本地購物車');
    } catch (error) {
      console.error('[LOCAL] 清空本地購物車失敗:', error);
    }
  }
};

// 健康檢查端點（需要在後端實現）
export const healthCheck = async (): Promise<boolean> => {
  try {
    const response = await fetch('/api/health', { 
      method: 'GET',
      timeout: 3000,
      headers: { 'Accept': 'application/json' }
    } as any);
    return response.ok;
  } catch (error) {
    console.warn('[HEALTH] 健康檢查失敗:', error);
    return false;
  }
};

// 匯出工具函數
export { sessionManager, apiHealth };