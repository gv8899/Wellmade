import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { buildBackendUrl, extractAuthHeader } from '@/utils/api-config';

/**
 * 處理 GET /api/admin/brands 請求
 * 獲取所有品牌（管理員權限）
 */
export async function GET(request: NextRequest) {
  try {
    // 準備請求標頭（包含認證）
    const headers = extractAuthHeader(request);

    // 構建完整的後端 URL
    const backendUrl = buildBackendUrl('admin/brands');
    
    console.log('代理管理員品牌請求到:', backendUrl);

    // 發送請求到後端
    const response = await axios.get(backendUrl, {
      headers,
      timeout: 10000,
    });

    // 返回後端響應
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('管理員品牌API路由錯誤:', error);
    
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
        error: '處理管理員品牌請求時發生錯誤',
        details: error.message,
        backendUrl: buildBackendUrl('admin/brands')
      }, 
      { status: 500 }
    );
  }
}

/**
 * 處理 POST /api/admin/brands 請求
 * 創建新品牌（管理員權限）
 */
export async function POST(request: NextRequest) {
  try {
    // 獲取請求 body
    const body = await request.json();
    
    // 準備請求標頭（包含認證）
    const headers = extractAuthHeader(request);

    // 構建完整的後端 URL
    const backendUrl = buildBackendUrl('admin/brands');
    
    console.log('代理創建品牌請求到:', backendUrl);
    console.log('請求資料:', body);

    // 發送請求到後端
    const response = await axios.post(backendUrl, body, {
      headers,
      timeout: 10000,
    });

    // 返回後端響應
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error('創建品牌API路由錯誤:', error);
    
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
        error: '處理創建品牌請求時發生錯誤',
        details: error.message,
        backendUrl: buildBackendUrl('admin/brands')
      }, 
      { status: 500 }
    );
  }
}