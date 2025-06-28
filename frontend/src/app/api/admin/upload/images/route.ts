import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { buildBackendUrl } from '@/utils/api-config';

/**
 * 處理 POST /api/admin/upload/images 請求
 * 上傳多張圖片（管理員權限）
 */
export async function POST(request: NextRequest) {
  try {
    // 獲取 FormData
    const formData = await request.formData();
    
    // 準備請求標頭（包含認證）
    const headers: HeadersInit = {};
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }
    // 注意：不要設置 Content-Type，讓 axios 自動處理 multipart/form-data

    // 構建完整的後端 URL
    const backendUrl = buildBackendUrl('admin/upload/images');
    
    console.log('代理批量圖片上傳請求到:', backendUrl);

    // 發送請求到後端
    const response = await axios.post(backendUrl, formData, {
      headers,
      timeout: 60000, // 批量上傳需要更長時間
    });

    // 直接使用後端返回的圖片 URL（主流做法）
    const responseData = response.data;
    // 不再進行 URL 轉換，直接使用後端的完整 URL
    // 後端 URL 格式：https://api.wellmade.select/uploads/filename.ext

    // 返回響應
    return NextResponse.json(responseData, { status: 201 });
  } catch (error) {
    console.error('批量圖片上傳API路由錯誤:', error);
    
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
        error: '處理批量圖片上傳請求時發生錯誤',
        details: error.message,
        backendUrl: buildBackendUrl('admin/upload/images')
      }, 
      { status: 500 }
    );
  }
}