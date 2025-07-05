import api from "./api";
import { EnhancedProduct, ProductStatus } from '@/types/product';

// 商品查詢參數
export interface QueryProductsDto {
  search?: string;
  category?: string; // 分類 slug
  brandId?: string;
  minPrice?: number;
  maxPrice?: number;
  skip?: number; // 後端使用 skip 而非 page
  take?: number; // 後端使用 take 而非 limit
  sortBy?: 'name' | 'price' | 'createdAt';
  order?: 'ASC' | 'DESC'; // 後端使用 order 而非 sortOrder
}

// 商品列表響應
export interface ProductListResponse {
  products: EnhancedProduct[];
  total: number;
}

// 商品API服務
export const productApi = {
  // 獲取商品列表（分頁）
  async getAll(params: QueryProductsDto = {}): Promise<ProductListResponse> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined && value !== null && value !== '')
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    const response = await api.get(`/products${queryString ? `?${queryString}` : ''}`);
    // 後端返回 { items: EnhancedProduct[], total: number }，需要轉換格式
    return {
      products: response.data.items || [],
      total: response.data.total || 0
    };
  },

  // 根據分類 slug 獲取商品
  async getByCategorySlug(slug: string, params: Omit<QueryProductsDto, 'category'> = {}): Promise<ProductListResponse> {
    const allParams = { ...params, category: slug };
    return this.getAll(allParams);
  },

  // 獲取單一商品
  async getOne(id: string): Promise<EnhancedProduct> {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },

  // 搜尋商品
  async search(query: string, params: Omit<QueryProductsDto, 'search'> = {}): Promise<ProductListResponse> {
    const allParams = { ...params, search: query };
    return this.getAll(allParams);
  },

  // 獲取推薦商品
  async getRecommended(productId?: string, limit: number = 4): Promise<EnhancedProduct[]> {
    const params = new URLSearchParams();
    if (productId) params.append('exclude', productId);
    params.append('limit', String(limit));
    params.append('featured', 'true');
    
    const response = await api.get(`/products/recommended?${params.toString()}`);
    return response.data;
  },

  // 獲取特色商品
  async getFeatured(limit: number = 8): Promise<EnhancedProduct[]> {
    const response = await api.get(`/products/featured?limit=${limit}`);
    return response.data;
  },
};