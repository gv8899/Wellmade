import api from './api';
import { User, UserRole } from '@/types/auth';
import { ProductVariant } from '@/types/product';

// 產品狀態枚舉
export enum ProductStatus {
  IN_STOCK = 'IN_STOCK',
  PREORDER = 'PREORDER', 
  OUT_OF_STOCK = 'OUT_OF_STOCK',
  DISCONTINUED = 'DISCONTINUED'
}

// 產品管理相關接口
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string; // 保留向後相容
  categoryId?: string; // 新增關聯ID
  categoryRelation?: Category; // 關聯分類物件
  brandId?: string;
  brand?: Brand;
  imageUrl?: string;
  images?: string[];
  keyFeatures?: KeyFeature[];
  featureDetails?: FeatureDetail[];
  faqs?: FAQ[];
  specTemplate?: string[]; // 產品規格模板
  isActive: boolean;
  status?: ProductStatus; // 新增狀態欄位
  createdAt: string;
  updatedAt: string;
}

// 分類介面 (簡化版，完整版在 categories.ts)
export interface Category {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  parentId?: string;
  parent?: Category;
  children?: Category[];
}

export interface Brand {
  id: string;
  name: string;
  logoUrl?: string;
  description?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface KeyFeature {
  image: string;
  title: string;
  subtitle?: string;
  description: string;
}

export interface FeatureDetail {
  type: 'image' | 'video';
  src: string;
  title: string;
  description: string;
  direction?: 'left' | 'right';
}

export interface FAQ {
  question: string;
  answer: string;
}

// API 響應類型
export interface AdminProductsResponse {
  items: Product[];
  total: number;
  page: number;
  limit: number;
}

export interface DashboardStats {
  products: {
    total: number;
    active: number;
    inactive: number;
  };
  brands: {
    total: number;
    active: number;
    inactive: number;
  };
  users: {
    total: number;
  };
}

export interface UsersResponse {
  users: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ImageUploadResponse {
  original: string;
  thumbnail: string;
  medium: string;
  url: string;
  filename: string;
  size: number;
}

export interface MultipleImageUploadResponse {
  images: ImageUploadResponse[];
  summary: {
    total: number;
    successful: number;
    failed: number;
  };
}

export interface BannerImageUploadResponse {
  original: string;
  thumbnail: string;
  medium: string;
  large: string;
  desktop: string;
  mobile: string;
  url: string;
  filename: string;
  size: number;
}

// Admin API 服務類
class AdminApiService {
  // ========== 產品管理 ==========
  
  async getAllProducts(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    brandId?: string;
    sortBy?: string;
    order?: 'ASC' | 'DESC';
  }): Promise<AdminProductsResponse> {
    const queryParams = new URLSearchParams();
    
    if (params) {
      // 轉換分頁參數：page/limit -> skip/take
      const { page, limit, ...otherParams } = params;
      
      if (page !== undefined && limit !== undefined) {
        queryParams.append('skip', (page * limit).toString());
        queryParams.append('take', limit.toString());
      }
      
      // 添加其他參數
      Object.entries(otherParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          queryParams.append(key, value.toString());
        }
      });
    }
    
    const response = await api.get(`/admin/products?${queryParams}`);
    return response.data;
  }

  async getProductById(id: string): Promise<Product> {
    const response = await api.get(`/admin/products/${id}`);
    return response.data;
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    const response = await api.post('/admin/products', data);
    return response.data;
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    const response = await api.patch(`/admin/products/${id}`, data);
    return response.data;
  }

  async deleteProduct(id: string): Promise<void> {
    await api.delete(`/admin/products/${id}`);
  }

  async toggleProductStatus(id: string): Promise<Product> {
    const response = await api.patch(`/admin/products/${id}/toggle-status`);
    return response.data;
  }

  // ========== 品牌管理 ==========

  async getAllBrands(): Promise<Brand[]> {
    const response = await api.get('/admin/brands');
    return response.data;
  }

  async createBrand(data: Partial<Brand>): Promise<Brand> {
    const response = await api.post('/admin/brands', data);
    return response.data;
  }

  async updateBrand(id: string, data: Partial<Brand>): Promise<Brand> {
    const response = await api.patch(`/admin/brands/${id}`, data);
    return response.data;
  }

  async deleteBrand(id: string): Promise<void> {
    await api.delete(`/admin/brands/${id}`);
  }

  async toggleBrandStatus(id: string): Promise<Brand> {
    const response = await api.patch(`/admin/brands/${id}/toggle-status`);
    return response.data;
  }

  // ========== 圖片上傳 ==========

  async uploadImage(file: File): Promise<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/admin/upload/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadImages(files: File[]): Promise<MultipleImageUploadResponse> {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('files', file);
    });

    const response = await api.post('/admin/upload/images', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async uploadBannerImage(file: File): Promise<BannerImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await api.post('/admin/upload/banner', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // ========== 統計資料 ==========

  async getDashboardStats(): Promise<DashboardStats> {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  }

  // ========== 用戶管理 ==========

  async getAllUsers(page = 1, limit = 20): Promise<UsersResponse> {
    const response = await api.get(`/admin/users?page=${page}&limit=${limit}`);
    return response.data;
  }

  async updateUserRoles(userId: string, roles: UserRole[]): Promise<User> {
    const response = await api.patch(`/admin/users/${userId}/roles`, { roles });
    return response.data;
  }

  // 分類管理
  async getAllCategories(): Promise<Category[]> {
    const response = await api.get('/categories/tree');
    return response.data;
  }

  // 產品變體管理
  async getProductVariants(productId: string): Promise<ProductVariant[]> {
    const response = await api.get(`/products/${productId}/variants`);
    return response.data;
  }

  async createProductVariant(productId: string, variantData: Partial<ProductVariant>): Promise<ProductVariant> {
    console.log('📤 [AdminAPI] 創建變體請求:', {
      productId,
      variantData,
      url: `/products/${productId}/variants`
    });
    
    try {
      const response = await api.post(`/products/${productId}/variants`, variantData);
      console.log('✅ [AdminAPI] 創建變體成功:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('❌ [AdminAPI] 創建變體失敗:', {
        error: error.response?.data || error.message,
        status: error.response?.status,
        data: error.response?.data
      });
      throw error;
    }
  }

  async updateProductVariant(variantId: string, variantData: Partial<ProductVariant>): Promise<ProductVariant> {
    const response = await api.patch(`/products/variants/${variantId}`, variantData);
    return response.data;
  }

  async deleteProductVariant(variantId: string): Promise<void> {
    await api.delete(`/products/variants/${variantId}`);
  }

  async updateVariantSortOrder(updates: { id: string; sortOrder: number }[]): Promise<void> {
    await api.patch('/products/variants/sort-order', updates);
  }
}

// 導出單例實例
export const adminApi = new AdminApiService();
export default adminApi;