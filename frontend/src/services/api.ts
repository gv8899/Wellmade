// API 服務，封裝與後端的通信邏輯
import axios from 'axios';

// 建立 Axios 實例
const api = axios.create({
  baseURL: '/api', // 使用 Next.js 代理路由
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // 允許跨域請求攜帶 cookie
  timeout: 10000, // 請求超時時間
});

// 添加請求攜帶與響應攔截
// 請求攔截
api.interceptors.request.use(
  async (config) => {
    console.log('發送請求:', config.url, config.params);
    
    // 在瀏覽器環境中添加 JWT token
    if (typeof window !== 'undefined') {
      // 嘗試從 NextAuth 獲取 token
      try {
        const { getSession } = await import('next-auth/react');
        const session = await getSession();
        
        if (session?.backendToken) {
          config.headers.Authorization = `Bearer ${session.backendToken}`;
          console.log('已添加 JWT token 到請求頭');
        } else {
          console.warn('沒有找到有效的 JWT token');
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

// 響應攔截
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

// 後端 API 的基本 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

/**
 * 品牌介面，與後端 Brand 實體對應
 */
export interface Brand {
  id: string;
  name: string;
  description: string;
  logoUrl: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 關鍵特性介面，與後端 KeyFeature 對應
 */
export interface KeyFeature {
  image: string;
  title: string;
  subtitle?: string;
  description: string;
}

/**
 * 特性詳情介面，與後端 FeatureDetail 對應
 */
export interface FeatureDetail {
  type: "image" | "video";
  src: string;
  title: string;
  description: string;
  direction?: "left" | "right";
}

/**
 * 常見問答介面，與後端 FAQItem 對應
 */
export interface FAQItem {
  question: string;
  answer: string;
}

/**
 * 產品介面，與後端 Product 實體對應
 */
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category?: string; // 舊分類（向後相容）
  categoryId?: string; // 新分類ID
  categoryRelation?: {
    id: string;
    name: string;
    slug: string;
    description?: string;
  }; // 新分類關聯
  imageUrl: string;
  images: string[];
  isActive: boolean;
  brandId?: string;
  brand?: Brand;
  keyFeatures?: KeyFeature[];
  featureDetails?: FeatureDetail[];
  faqs?: FAQItem[];
  createdAt?: string;
  updatedAt?: string;
}

/**
 * 分類介面
 */
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  parentId?: string;
  parent?: Category;
  children?: Category[];
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
 * 獲取產品列表
 * @param params 查詢參數
 */
export const getProducts = async (params: ProductQueryParams = {}): Promise<PagedResult<Product>> => {
  try {
    const response = await api.get('/products', { params });
    return response.data;
  } catch (error) {
    console.error('獲取產品列表失敗:', error);
    throw error;
  }
};

/**
 * 獲取增強的產品列表（包含變體價格範圍信息）
 * @param params 查詢參數
 */
export const getEnhancedProducts = async (params: ProductQueryParams = {}): Promise<PagedResult<import('@/types/product').EnhancedProduct>> => {
  try {
    // 首先獲取基本產品列表
    const productsResponse = await getProducts(params);
    
    // 為每個產品計算增強信息
    const enhancedProducts = await Promise.all(
      productsResponse.items.map(async (product) => {
        try {
          // 嘗試從詳細產品信息中獲取變體
          const detailedProduct = await getProductById(product.id);
          
          // 計算價格範圍
          let priceRange: import('@/types/product').PriceRange;
          let availableVariantsCount = 0;
          
          if (detailedProduct.variants && detailedProduct.variants.length > 0) {
            const activePrices = detailedProduct.variants
              .filter(v => v.isActive)
              .map(v => import('@/types/product').getCurrentPrice(v));
            
            if (activePrices.length > 0) {
              const minPrice = Math.min(...activePrices);
              const maxPrice = Math.max(...activePrices);
              
              priceRange = minPrice === maxPrice 
                ? { price: minPrice }
                : { minPrice, maxPrice };
              
              availableVariantsCount = detailedProduct.variants.filter(v => 
                v.isActive && import('@/types/product').canPurchaseVariant(v)
              ).length;
            } else {
              priceRange = { price: product.price };
            }
          } else {
            priceRange = { price: product.price };
            availableVariantsCount = 1;
          }
          
          // 構建增強產品對象
          const enhancedProduct: import('@/types/product').EnhancedProduct = {
            id: product.id,
            name: product.name,
            masterSku: product.masterSku,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: getProductCategoryName(product),
            imageUrl: product.imageUrl,
            images: product.images || [],
            isActive: product.isActive,
            status: product.status || import('@/types/product').ProductStatus.IN_STOCK,
            brandId: product.brandId,
            brand: product.brand,
            categoryRelation: product.categoryRelation,
            variants: detailedProduct.variants,
            keyFeatures: product.keyFeatures,
            featureDetails: product.featureDetails,
            faqs: product.faqs,
            overallStatus: product.status || import('@/types/product').ProductStatus.IN_STOCK,
            priceRange,
            availableVariantsCount,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
          };
          
          return enhancedProduct;
        } catch (error) {
          console.warn(`無法獲取產品 ${product.id} 的詳細信息，使用基本信息:`, error);
          
          // 如果無法獲取詳細信息，使用基本產品信息構建增強對象
          return {
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            stock: product.stock,
            category: getProductCategoryName(product),
            imageUrl: product.imageUrl,
            images: product.images || [],
            isActive: product.isActive,
            status: product.status || import('@/types/product').ProductStatus.IN_STOCK,
            brandId: product.brandId,
            brand: product.brand,
            categoryRelation: product.categoryRelation,
            overallStatus: product.status || import('@/types/product').ProductStatus.IN_STOCK,
            priceRange: { price: product.price },
            availableVariantsCount: 1,
            createdAt: product.createdAt,
            updatedAt: product.updatedAt
          } as import('@/types/product').EnhancedProduct;
        }
      })
    );
    
    return {
      items: enhancedProducts,
      total: productsResponse.total
    };
  } catch (error) {
    console.error('獲取增強產品列表失敗:', error);
    // 回退到基本產品列表
    const basicProducts = await getProducts(params);
    const enhancedProducts = basicProducts.items.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      stock: product.stock,
      category: getProductCategoryName(product),
      imageUrl: product.imageUrl,
      images: product.images || [],
      isActive: product.isActive,
      status: product.status || import('@/types/product').ProductStatus.IN_STOCK,
      brandId: product.brandId,
      brand: product.brand,
      categoryRelation: product.categoryRelation,
      overallStatus: product.status || import('@/types/product').ProductStatus.IN_STOCK,
      priceRange: { price: product.price },
      availableVariantsCount: 1,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt
    } as import('@/types/product').EnhancedProduct));
    
    return {
      items: enhancedProducts,
      total: basicProducts.total
    };
  }
};

/**
 * 獲取單個產品詳情
 * @param id 產品ID
 */
export const getProductById = async (id: string): Promise<Product> => {
  try {
    const response = await api.get(`/products/${id}`);
    return response.data;
  } catch (error) {
    console.error(`獲取產品 ${id} 詳情失敗:`, error);
    throw error;
  }
};

/**
 * 建立新產品
 * @param product 產品資料
 */
export const createProduct = async (product: Omit<Product, 'id'>): Promise<Product> => {
  const response = await api.post('/products', product);
  return response.data;
};

/**
 * 更新產品
 * @param id 產品ID
 * @param product 要更新的產品資料
 */
export const updateProduct = async (id: string, product: Partial<Product>): Promise<Product> => {
  const response = await api.patch(`/products/${id}`, product);
  return response.data;
};

/**
 * 刪除產品
 * @param id 要刪除的產品ID
 */
export const deleteProduct = async (id: string): Promise<void> => {
  await api.delete(`/products/${id}`);
};

/**
 * 獲取品牌列表
 */
export const getBrands = async (): Promise<Brand[]> => {
  const response = await api.get('/brands');
  return response.data;
};

/**
 * 獲取單個品牌詳情
 * @param id 品牌ID
 */
export const getBrandById = async (id: string): Promise<Brand> => {
  const response = await api.get(`/brands/${id}`);
  return response.data;
};

/**
 * 獲取分類列表（包含樹狀結構）
 */
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get('/categories/tree');
    return response.data;
  } catch (error) {
    console.error('獲取分類列表失敗:', error);
    // 回退到基本的分類列表
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (fallbackError) {
      console.error('獲取基本分類列表也失敗:', fallbackError);
      return [];
    }
  }
};

/**
 * 獲取啟用的分類列表（用於前台篩選）
 */
export const getActiveCategories = async (): Promise<Category[]> => {
  try {
    const categories = await getCategories();
    return categories.filter(cat => cat.isActive);
  } catch (error) {
    console.error('獲取啟用分類失敗:', error);
    return [];
  }
};

/**
 * 獲取產品的分類名稱（優先使用新的分類系統）
 * @param product 產品物件
 * @returns 分類名稱
 */
export const getProductCategoryName = (product: Product): string => {
  // 優先使用新的分類關聯
  if (product.categoryRelation?.name) {
    return product.categoryRelation.name;
  }
  
  
  // 預設值
  return '未分類';
};

/**
 * 獲取產品的分類Slug（用於篩選）
 * @param product 產品物件
 * @returns 分類slug
 */
export const getProductCategorySlug = (product: Product): string => {
  // 優先使用新的分類關聯
  if (product.categoryRelation?.slug) {
    return product.categoryRelation.slug;
  }
  
  
  return '';
};

// 導出默認的 api 實例
export default api;
