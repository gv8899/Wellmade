// API 服務，封裝與後端的通信邏輯
import axios from 'axios';

// 建立 Axios 實例
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003',
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允許跨域請求攜帶 cookie
  timeout: 10000, // 請求超時時間
});

// 添加請求攜帶與應答攜帶
// 請求攜帶
api.interceptors.request.use(
  (config) => {
    console.log('發送請求:', config.url, config.params);
    return config;
  },
  (error) => {
    console.error('請求錯誤:', error);
    return Promise.reject(error);
  }
);

// 應答攜帶
api.interceptors.response.use(
  (response) => {
    console.log('收到應答:', response.status, response.data);
    return response;
  },
  (error) => {
    console.error('應答錯誤:', error);
    return Promise.reject(error);
  }
);

// 後端 API 的基本 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

/**
 * 產品介面，與後端 Product 實體對應
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  imageUrl: string; // 主要圖片
  images: string[]; // 多張圖片
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 分頁結果介面
 */
export interface PagedResult<T> {
  items: T[];
  total: number;
}

/**
 * 查詢參數介面
 */
export interface ProductQueryParams {
  skip?: number;
  take?: number;
  sortBy?: string;
  order?: 'ASC' | 'DESC';
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  search?: string;
}

/**
 * 獲取商品列表
 * @param params 查詢參數
 */
export async function getProducts(params: ProductQueryParams = {}): Promise<PagedResult<Product>> {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('獲取商品列表失敗 (raw):', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.message);
      console.error('Response Status:', error.response?.status);
      console.error('Response Data:', error.response?.data);
      console.error('Request Config:', error.config);
    } else if (error instanceof Error) {
      console.error('Error Name:', error.name);
      console.error('Error Message:', error.message);
      console.error('Error Stack:', error.stack);
    } else {
      console.error('詳細錯誤信息 (JSON.stringify):', JSON.stringify(error, Object.getOwnPropertyNames(error)));
    }
    throw error;
  }
}

/**
 * 獲取單個商品詳情
 * @param id 商品ID
 */
export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error('獲取商品詳情失敗:', error);
    if (axios.isAxiosError(error)) {
      console.error('Axios Error:', error.message);
      console.error('Response Status:', error.response?.status);
      console.error('Response Data:', error.response?.data);
    }
    throw error;
  }
}
