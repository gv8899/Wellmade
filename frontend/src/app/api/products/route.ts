import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 後端 API 基礎 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3003';

/**
 * 處理 GET /api/products 請求
 */
export async function GET(request: NextRequest) {
  try {
    // 獲取查詢參數
    const searchParams = request.nextUrl.searchParams;
    const queryString = searchParams.toString();
    
    // 準備請求選項
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 構建完整的後端 URL
    const backendUrl = `${API_BASE_URL}/products${queryString ? `?${queryString}` : ''}`;
    
    console.log('代理產品請求到:', backendUrl);

    // 發送請求到後端
    const response = await axios.get(backendUrl, {
      headers,
      timeout: 10000,
    });

    // 返回後端響應
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('產品API路由錯誤:', error);
    console.error('錯誤詳情:', error.message);
    console.error('錯誤堆疊:', error.stack);
    return NextResponse.json(
      { 
        error: '處理產品請求時發生錯誤',
        details: error.message,
        backendUrl: `${API_BASE_URL}/products`
      }, 
      { status: 500 }
    );
  }
}