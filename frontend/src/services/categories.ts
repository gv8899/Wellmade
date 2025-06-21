import api from "./api";

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

// 分類API服務
export const categoryApi = {
  // 獲取分類列表（分頁）
  async getAll(params: QueryCategoryDto = {}): Promise<CategoryListResponse> {
    const queryString = new URLSearchParams(
      Object.entries(params)
        .filter(([_, value]) => value !== undefined)
        .map(([key, value]) => [key, String(value)])
    ).toString();
    
    const response = await api.get(`/categories${queryString ? `?${queryString}` : ''}`);
    return response.data;
  },

  // 獲取分類樹狀結構
  async getTree(): Promise<Category[]> {
    const response = await api.get('/categories/tree');
    return response.data;
  },

  // 獲取單一分類
  async getOne(id: string): Promise<Category> {
    const response = await api.get(`/categories/${id}`);
    return response.data;
  },

  // 根據slug獲取分類
  async getBySlug(slug: string): Promise<Category> {
    const response = await api.get(`/categories/slug/${slug}`);
    return response.data;
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