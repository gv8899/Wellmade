// API 服務，封裝與後端的通信邏輯

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
  // 轉換查詢參數為 URL 查詢字符串
  const queryParams = new URLSearchParams();
  
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null) {
      queryParams.append(key, value.toString());
    }
  }
  
  const queryString = queryParams.toString();
  const url = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
  
  try {
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`API 錯誤: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('獲取商品列表失敗:', error);
    throw error;
  }
}

/**
 * 獲取單個商品詳情
 * @param id 商品ID
 */
export async function getProductById(id: string): Promise<Product> {
  try {
    const response = await fetch(`${API_BASE_URL}/products/${id}`);
    
    if (!response.ok) {
      throw new Error(`API 錯誤: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error(`獲取商品 ${id} 詳情失敗:`, error);
    throw error;
  }
}
