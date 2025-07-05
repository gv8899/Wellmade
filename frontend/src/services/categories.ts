import api from "./api";
import axios from 'axios';

// 分類介面定義
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  sortOrder: number;
  isActive: boolean;
  metaTitle?: string;
  metaDescription?: string;
  createdAt: string;
  updatedAt: string;
}

// 創建分類DTO
export interface CreateCategoryDto {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

// 更新分類DTO
export interface UpdateCategoryDto {
  name?: string;
  slug?: string;
  description?: string;
  imageUrl?: string;
  parentId?: string;
  sortOrder?: number;
  isActive?: boolean;
  metaTitle?: string;
  metaDescription?: string;
}

// 查詢參數
export interface QueryCategoryDto {
  search?: string;
  parentId?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

// 分類列表響應
export interface CategoryListResponse {
  categories: Category[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// 判斷是否在服務器端
const isServer = typeof window === 'undefined';

// 獲取後端基礎 URL
const getBackendUrl = () => {
  if (isServer) {
    // 服務器端：優先使用 BACKEND_URL（與 next.config.js 一致）
    const backendUrl = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || 'https://api.wellmade.select';
    console.log('[getBackendUrl] 服務器端使用:', backendUrl);
    return backendUrl;
  }
  // 客戶端：使用代理路由
  return '/api';
};

// 分類API服務
export const categoryApi = {
  // 獲取分類列表（分頁）
  async getAll(params: QueryCategoryDto = {}): Promise<CategoryListResponse> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    if (isServer) {
      // 服務器端直接調用後端
      const backendUrl = getBackendUrl();
      const response = await axios.get(`${backendUrl}/categories${queryString ? `?${queryString}` : ''}`, {
        timeout: 10000,
      });
      return response.data;
    } else {
      // 客戶端使用代理
      const response = await api.get(`/categories${queryString ? `?${queryString}` : ''}`);
      return response.data;
    }
  },

  // 獲取分類樹狀結構
  async getTree(): Promise<Category[]> {
    if (isServer) {
      const backendUrl = getBackendUrl();
      const response = await axios.get(`${backendUrl}/categories/tree`, {
        timeout: 10000,
      });
      return response.data;
    } else {
      const response = await api.get('/categories/tree');
      return response.data;
    }
  },

  // 獲取單一分類
  async getOne(id: string): Promise<Category> {
    if (isServer) {
      const backendUrl = getBackendUrl();
      const response = await axios.get(`${backendUrl}/categories/${id}`, {
        timeout: 10000,
      });
      return response.data;
    } else {
      const response = await api.get(`/categories/${id}`);
      return response.data;
    }
  },

  // 根據slug獲取分類
  async getBySlug(slug: string): Promise<Category> {
    if (isServer) {
      const backendUrl = getBackendUrl();
      const response = await axios.get(`${backendUrl}/categories/slug/${slug}`, {
        timeout: 10000,
      });
      return response.data;
    } else {
      const response = await api.get(`/categories/slug/${slug}`);
      return response.data;
    }
  },

  // 創建分類
  async create(data: CreateCategoryDto): Promise<Category> {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // 更新分類
  async update(id: string, data: UpdateCategoryDto): Promise<Category> {
    const response = await api.patch(`/categories/${id}`, data);
    return response.data;
  },

  // 批量更新排序
  async updateSortOrder(updates: { id: string; sortOrder: number }[]): Promise<void> {
    await api.put('/categories/sort-order', updates);
  },

  // 刪除分類
  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};