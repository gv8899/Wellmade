import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { buildBackendUrl, extractAuthHeader } from '@/utils/api-config';

/**
 * 處理 GET /api/admin/dashboard/stats 請求
 * 獲取管理員儀表板統計資料
 */
export async function GET(request: NextRequest) {
  try {
    // 準備請求標頭（包含認證）
    const headers = extractAuthHeader(request);

    // 構建完整的後端 URL
    const backendUrl = buildBackendUrl('admin/dashboard/stats');
    
    console.log('代理儀表板統計請求到:', backendUrl);

    // 發送請求到後端
    const response = await axios.get(backendUrl, {
      headers,
      timeout: 10000,
    });

    // 返回後端響應
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('儀表板統計API路由錯誤:', error);
    
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
        error: '處理儀表板統計請求時發生錯誤',
        details: error.message,
        backendUrl: buildBackendUrl('admin/dashboard/stats')
      }, 
      { status: 500 }
    );
  }
}