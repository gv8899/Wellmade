import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 後端 API 基礎 URL
const API_BASE_URL = process.env.BACKEND_URL || 'http://127.0.0.1:3003';

/**
 * 處理 GET /api/categories 請求
 */
export async function GET(request: NextRequest) {
  try {
    // 準備請求選項
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 構建完整的後端 URL
    const backendUrl = `${API_BASE_URL}/categories`;
    
    console.log('代理分類請求到:', backendUrl);

    // 發送請求到後端
    const response = await axios.get(backendUrl, {
      headers,
      timeout: 10000,
    });

    // 返回後端響應
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('分類API路由錯誤:', error);
    console.error('錯誤詳情:', error.message);
    console.error('錯誤堆疊:', error.stack);
    return NextResponse.json(
      { 
        error: '處理分類請求時發生錯誤',
        details: error.message,
        backendUrl: `${API_BASE_URL}/categories`
      }, 
      { status: 500 }
    );
  }
}

/**
 * 處理 POST /api/categories 請求
 */
export async function POST(request: NextRequest) {
  try {
    // 獲取請求 body
    const body = await request.json();
    
    // 準備請求標頭
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 從前端請求中獲取 Authorization header 並轉發
    const authHeader = request.headers.get('authorization');
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    // 構建完整的後端 URL
    const backendUrl = `${API_BASE_URL}/categories`;
    
    console.log('代理創建分類請求到:', backendUrl);
    console.log('請求資料:', body);

    // 發送請求到後端
    const response = await axios.post(backendUrl, body, {
      headers,
      timeout: 10000,
    });

    // 返回後端響應
    return NextResponse.json(response.data, { status: 201 });
  } catch (error) {
    console.error('創建分類API路由錯誤:', error);
    
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
        error: '處理創建分類請求時發生錯誤',
        details: error.message,
        backendUrl: `${API_BASE_URL}/categories`
      }, 
      { status: 500 }
    );
  }
}