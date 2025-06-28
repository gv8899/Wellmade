import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { buildBackendUrl, extractAuthHeader } from '@/utils/api-config';

/**
 * 處理 GET /api/admin/users 請求
 * 獲取所有用戶（管理員權限）
 */
export async function GET(request: NextRequest) {
  try {
    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // 準備請求標頭（包含認證）
    const headers = extractAuthHeader(request);

    // 構建完整的後端 URL
    const backendUrl = buildBackendUrl(`admin/users${queryString ? `?${queryString}` : ''}`);
    
    console.log('代理管理員用戶請求到:', backendUrl);

    // 發送請求到後端
    const response = await axios.get(backendUrl, {
      headers,
      timeout: 10000,
    });

    // 返回後端響應
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('管理員用戶API路由錯誤:', error);
    
    // 如果是 axios 錯誤，保留原始狀態碼
    if (axios.isAxiosError(error) && error.response) {
      console.error('後端錯誤響應:', error.response.data);
      return NextResponse.json(
        error.response.data,
        { status: error.response.status }
      );
    }
    
    console.error('錯誤詳情:', error.message);
    return NextResponse.json(
      { 
        error: '處理管理員用戶請求時發生錯誤',
        details: error.message,
        backendUrl: buildBackendUrl('admin/users')
      }, 
      { status: 500 }
    );
  }
}