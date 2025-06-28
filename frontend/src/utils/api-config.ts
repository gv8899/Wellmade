/**
 * API 配置工具
 * 統一管理本地開發和部署環境的 API URL
 */

/**
 * 獲取後端 API 基礎 URL
 * 優先級：BACKEND_URL > NEXT_PUBLIC_API_URL > localhost
 */
export function getBackendUrl(): string {
  // 伺服器端環境變數（部署環境）
  if (process.env.BACKEND_URL) {
    return process.env.BACKEND_URL;
  }
  
  // 客戶端環境變數（本地開發）
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  
  // 預設本地開發環境
  return 'http://localhost:3003';
}

/**
 * 建構完整的後端 API URL
 * @param path API 路徑（不需要開頭的 /）
 */
export function buildBackendUrl(path: string): string {
  const baseUrl = getBackendUrl();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${baseUrl}/${cleanPath}`;
}

/**
 * 通用的 API 請求標頭
 */
export function getCommonHeaders(): HeadersInit {
  return {
    'Content-Type': 'application/json',
  };
}

/**
 * 從請求中提取並轉發認證標頭
 */
export function extractAuthHeader(request: Request): HeadersInit {
  const headers = getCommonHeaders();
  const authHeader = request.headers.get('authorization');
  
  if (authHeader) {
    (headers as any)['Authorization'] = authHeader;
  }
  
  return headers;
}