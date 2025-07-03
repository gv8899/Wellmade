import { NextRequest, NextResponse } from 'next/server';
import { getSafeSession, prepareBackendHeaders } from '../utils/session';
import axios from 'axios';

// 後端 API 基礎 URL - 強制使用 IPv4
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3003';

/**
 * 處理 GET /api/cart 請求
 */
export async function GET(request: NextRequest) {
  try {
    console.log('購物車 API - 開始處理請求');

    // 準備基本請求 headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 複製原始請求的 Cookie（保持 session 狀態）
    const cookieHeader = request.headers.get('cookie');
    if (cookieHeader) {
      headers.Cookie = cookieHeader;
    }

    console.log('發送請求到後端:', `${API_BASE_URL}/cart`);

    // 發送請求到後端
    const response = await axios.get(`${API_BASE_URL}/cart`, {
      headers,
      timeout: 10000,
      validateStatus: (status) => status < 500, // 允許 4xx 狀態碼通過
    });

    console.log('後端響應狀態:', response.status);
    return NextResponse.json(response.data, { status: response.status });
  } catch (error: any) {
    console.error('購物車API路由錯誤:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    });
    
    return NextResponse.json(
      { error: '處理購物車請求時發生錯誤' }, 
      { status: 500 }
    );
  }
}

/**
 * 處理 DELETE /api/cart 請求 (清空購物車)
 */
export async function DELETE(request: NextRequest) {
  try {
    // 安全獲取用戶會話 - 本地和正式環境兼容
    const session = await getSafeSession();
    
    // 準備請求 headers
    const headers = prepareBackendHeaders(request, session);

    const response = await axios.delete(`${API_BASE_URL}/cart`, {
      headers,
      timeout: 10000,
      validateStatus: (status) => status < 500,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('清空購物車請求錯誤:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      code: error.code
    });
    return NextResponse.json(
      { error: '處理清空購物車請求時發生錯誤' }, 
      { status: 500 }
    );
  }
}
