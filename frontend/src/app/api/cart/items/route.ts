import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';
import axios from 'axios';

// 後端 API 基礎 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3003';

/**
 * 處理 POST /api/cart/items 請求 (添加商品到購物車)
 */
export async function POST(request: NextRequest) {
  try {
    // 獲取用戶會話
    const session = await getServerSession(authOptions);
    console.log('API Route - 添加購物車項目 - 用戶會話:', {
      hasSession: !!session,
      hasBackendToken: !!(session && (session as any).backendToken)
    });

    // 解析請求正文
    const body = await request.json();

    // 準備請求選項
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 如果有會話，添加授權標頭
    if (session && (session as any).backendToken) {
      headers.Authorization = `Bearer ${(session as any).backendToken}`;
    }

    // 發送請求到後端
    const response = await axios.post(`${API_BASE_URL}/cart/items`, body, {
      headers,
      withCredentials: true,
      timeout: 10000,
    });

    // 返回後端響應
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('處理添加購物車項目請求時發生錯誤:', error);
    return NextResponse.json(
      { error: '處理添加購物車項目請求時發生錯誤' }, 
      { status: 500 }
    );
  }
}

