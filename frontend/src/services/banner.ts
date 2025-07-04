import { 
  Banner, 
  CreateBannerDto, 
  UpdateBannerDto, 
  QueryBannerDto, 
  BannerListResponse,
  BannerPosition 
} from '@/types/banner';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';

// 獲取認證 Token（使用 NextAuth session）
async function getAuthToken(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const { getSession } = await import('next-auth/react');
    const session = await getSession();
    return session?.backendToken || null;
  } catch (error) {
    console.error('獲取認證 token 失敗:', error);
    return null;
  }
}

// 創建 API 請求 Headers
async function createHeaders(includeAuth = true): Promise<HeadersInit> {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (includeAuth) {
    const token = await getAuthToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }
  
  return headers;
}

// 處理 API 響應
async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorData = await response.text();
    throw new Error(`API Error: ${response.status} - ${errorData}`);
  }
  
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  
  return response.text() as T;
}

/**
 * Banner API 服務類
 */
export class BannerService {
  
  /**
   * 獲取公開 Banner 列表（前台使用）
   */
  static async getPublicBanners(position?: BannerPosition): Promise<Banner[]> {
    const url = position 
      ? `${API_BASE_URL}/banners/position/${position}`
      : `${API_BASE_URL}/banners`;
      
    const response = await fetch(url, {
      method: 'GET',
      headers: await createHeaders(false), // 公開 API 不需要認證
    });
    
    return handleResponse<Banner[]>(response);
  }

  /**
   * 獲取 Banner 列表（管理員使用）
   */
  static async getBanners(query: QueryBannerDto = {}): Promise<BannerListResponse> {
    const params = new URLSearchParams();
    
    Object.entries(query).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params.append(key, String(value));
      }
    });
    
    const url = `${API_BASE_URL}/banners/admin?${params.toString()}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: await createHeaders(true),
    });
    
    return handleResponse<BannerListResponse>(response);
  }

  /**
   * 獲取單個 Banner
   */
  static async getBanner(id: string): Promise<Banner> {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'GET',
      headers: await createHeaders(true),
    });
    
    return handleResponse<Banner>(response);
  }

  /**
   * 創建 Banner
   */
  static async createBanner(data: CreateBannerDto): Promise<Banner> {
    const response = await fetch(`${API_BASE_URL}/banners`, {
      method: 'POST',
      headers: await createHeaders(true),
      body: JSON.stringify(data),
    });
    
    return handleResponse<Banner>(response);
  }

  /**
   * 更新 Banner
   */
  static async updateBanner(id: string, data: UpdateBannerDto): Promise<Banner> {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'PATCH',
      headers: await createHeaders(true),
      body: JSON.stringify(data),
    });
    
    return handleResponse<Banner>(response);
  }

  /**
   * 刪除 Banner
   */
  static async deleteBanner(id: string): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/banners/${id}`, {
      method: 'DELETE',
      headers: await createHeaders(true),
    });
    
    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`刪除 Banner 失敗: ${response.status} - ${errorData}`);
    }
  }

  /**
   * 切換 Banner 啟用狀態
   */
  static async toggleBannerActive(id: string): Promise<Banner> {
    const response = await fetch(`${API_BASE_URL}/banners/${id}/toggle`, {
      method: 'PATCH',
      headers: await createHeaders(true),
    });
    
    return handleResponse<Banner>(response);
  }

  /**
   * 更新 Banner 排序
   */
  static async updateBannerSortOrder(id: string, sortOrder: number): Promise<Banner> {
    const response = await fetch(`${API_BASE_URL}/banners/${id}/sort-order`, {
      method: 'PATCH',
      headers: await createHeaders(true),
      body: JSON.stringify({ sortOrder }),
    });
    
    return handleResponse<Banner>(response);
  }

  /**
   * 批量更新 Banner 排序
   */
  static async updateBatchSortOrder(updates: { id: string; sortOrder: number }[]): Promise<Banner[]> {
    const response = await fetch(`${API_BASE_URL}/banners/batch/sort-order`, {
      method: 'PATCH',
      headers: await createHeaders(true),
      body: JSON.stringify({ updates }),
    });
    
    return handleResponse<Banner[]>(response);
  }
}

// 默認導出
export default BannerService;