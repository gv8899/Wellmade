import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import { buildBackendUrl, extractAuthHeader } from '@/utils/api-config';

/**
 * 處理 GET /api/admin/products 請求
 * 獲取所有產品（管理員權限）
 */
export async function GET(request: NextRequest) {
  try {
    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // 準備請求標頭（包含認證）
    const headers = extractAuthHeader(request);

    // 構建完整的後端 URL
    const backendUrl = buildBackendUrl(`admin/products${queryString ? `?${queryString}` : ''}`);
    
    console.log('代理管理員產品請求到:', backendUrl);

    // 發送請求到後端
    const response = await axios.get(backendUrl, {
      headers,
      timeout: 10000,
    });

    // 返回後端響應
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('管理員產品API路由錯誤:', error);
    
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
        error: '處理管理員產品請求時發生錯誤',
        details: error.message,
        backendUrl: buildBackendUrl('admin/products')
      }, 
      { status: 500 }
    );
  }
}

/**
 * 處理 POST /api/admin/products 請求
 * 創建新產品（管理員權限）
 */
export async function POST(request: NextRequest) {
  try {
    // 獲取請求 body
    const body = await request.json();
    
    // 準備請求標頭（包含認證）
    const headers = extractAuthHeader(request);

    // 構建完整的後端 URL
    const backendUrl = buildBackendUrl('admin/products');
    
    console.log('代理創建產品請求到:', backendUrl);
    console.log('請求資料:', body);

    // 發送請求到後端
    const response = await axios.post(backendUrl, body, {
      headers,
      timeout: 10000,
    });

    // 返回後端響應
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error('創建產品API路由錯誤:', error);
    
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
        error: '處理創建產品請求時發生錯誤',
        details: error.message,
        backendUrl: buildBackendUrl('admin/products')
      }, 
      { status: 500 }
    );
  }
}