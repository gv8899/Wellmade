import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';
import axios from 'axios';

// 後端 API 基礎 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3003';

/**
 * 處理 GET /api/cart 請求
 */
export async function GET(request: NextRequest) {
  try {
    // 獲取用戶會話
    const session = await getServerSession(authOptions);
    console.log('API Route - 獲取購物車 - 用戶會話詳情:', {
      hasSession: !!session,
      hasBackendToken: !!(session && (session as any).backendToken),
      email: session?.user?.email,
      tokenType: session && (session as any).backendToken ? typeof (session as any).backendToken : 'undefined',
      tokenLength: session && (session as any).backendToken ? (session as any).backendToken.length : 0
    });
    
    if(session) {
      console.log('完整會話內容 (敏感信息已隱藏):', {
        ...session,
        backendToken: (session as any).backendToken ? `${(session as any).backendToken.substring(0, 10)}...` : null
      });
    }

    // 準備請求選項
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 如果有會話，添加授權標頭
    if (session && (session as any).backendToken) {
      headers.Authorization = `Bearer ${(session as any).backendToken}`;
      console.log('添加授權標頭:', `Bearer ${(session as any).backendToken.substring(0, 10)}...`);
    } else {
      console.warn('無法添加授權標頭 - 缺少會話或令牌', {
        hasSession: !!session,
        hasBackendToken: session ? !!(session as any).backendToken : false
      });
    }

    // 發送請求到後端
    const response = await axios.get(`${API_BASE_URL}/cart`, {
      headers,
      withCredentials: true, // 包括 cookies
      timeout: 10000,
    });

    // 返回後端響應
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('購物車API路由錯誤:', error);
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
    const session = await getServerSession(authOptions);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session && (session as any).backendToken) {
      headers.Authorization = `Bearer ${(session as any).backendToken}`;
    }

    const response = await axios.delete(`${API_BASE_URL}/cart`, {
      headers,
      withCredentials: true,
      timeout: 10000,
    });

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('清空購物車請求錯誤:', error);
    return NextResponse.json(
      { error: '處理清空購物車請求時發生錯誤' }, 
      { status: 500 }
    );
  }
}
