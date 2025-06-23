// 產品變體和購物車 API 服務
import axios from 'axios';
import { ProductVariant, ProductSpecOption } from '@/app/product/[id]/ProductPurchaseOptions';

// 使用與主 API 相同的基本配置
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 10000,
});

// 添加請求與響應攔截
api.interceptors.request.use(
  async (config) => {
    console.log('發送請求:', config.url, config.params);
    
    // 在瀏覽器環境中添加 JWT token
    if (typeof window !== 'undefined') {
      try {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        
        if (session?.backendToken) {
          config.headers.Authorization = `Bearer ${session.backendToken}`;
        }
      } catch (error) {
        console.error('獲取 session 失敗:', error);
      }
    }
    
    return config;
  },
  (error) => {
    console.error('請求錯誤:', error);
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => {
    console.log('接收響應:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('響應錯誤:', error);
    return Promise.reject(error);
  }
);

/**
 * 產品變體 API 響應接口
 */
export interface ProductVariantResponse {
  variants: ProductVariant[];
  specOptions: ProductSpecOption[];
}

/**
 * 購物車項目接口
 */
export interface CartItemRequest {
  productId: string;
  variantId: string;
  quantity: number;
  specs: { [key: string]: string };
}

/**
 * 獲取產品的所有變體和規格選項
 * @param productId 產品 ID
 * @returns 產品變體和規格選項
 */
export async function getProductVariants(productId: string): Promise<ProductVariantResponse> {
  try {
    const response = await api.get(`/products/${productId}/variants`);
    return response.data;
  } catch (error) {
    console.error('獲取產品變體失敗:', error);
    // 返回空數據作為後備
    return {
      variants: [],
      specOptions: []
    };
  }
}

/**
 * 添加商品到購物車
 * @param item 購物車項目
 * @returns 成功或失敗的響應
 */
export async function addToCart(item: CartItemRequest): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.post('/cart/items', item);
    return {
      success: true,
      message: '成功添加到購物車'
    };
  } catch (error) {
    console.error('添加到購物車失敗:', error);
    return {
      success: false,
      message: '添加到購物車失敗，請稍後再試'
    };
  }
}

/**
 * 更新購物車項目數量
 * @param itemId 購物車項目 ID
 * @param quantity 新數量
 * @returns 成功或失敗的響應
 */
export async function updateCartItemQuantity(
  itemId: string,
  quantity: number
): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.patch(`/cart/items/${itemId}`, { quantity });
    return {
      success: true,
      message: '成功更新購物車'
    };
  } catch (error) {
    console.error('更新購物車失敗:', error);
    return {
      success: false,
      message: '更新購物車失敗，請稍後再試'
    };
  }
}

/**
 * 從購物車中移除項目
 * @param itemId 購物車項目 ID
 * @returns 成功或失敗的響應
 */
export async function removeFromCart(itemId: string): Promise<{ success: boolean; message: string }> {
  try {
    const response = await api.delete(`/cart/items/${itemId}`);
    return {
      success: true,
      message: '成功從購物車移除'
    };
  } catch (error) {
    console.error('從購物車移除失敗:', error);
    return {
      success: false,
      message: '從購物車移除失敗，請稍後再試'
    };
  }
}

/**
 * 預覽將要生成的 SKU
 * @param productId 產品 ID
 * @param specs 變體規格
 * @returns SKU 預覽
 */
export async function previewSku(
  productId: string,
  specs?: Record<string, string>
): Promise<string> {
  try {
    const response = await api.post(`/products/${productId}/variants/sku-preview`, { specs });
    return response.data.sku;
  } catch (error) {
    console.error('預覽 SKU 失敗:', error);
    return '';
  }
}

/**
 * 檢查 SKU 是否可用
 * @param sku SKU
 * @param productId 產品 ID（可選）
 * @returns 是否可用
 */
export async function checkSkuAvailability(
  sku: string,
  productId?: string
): Promise<boolean> {
  try {
    const response = await api.post(`/products/variants/sku/${sku}/check`, {
      productId
    });
    return response.data.isAvailable;
  } catch (error) {
    console.error('檢查 SKU 可用性失敗:', error);
    return false;
  }
}
