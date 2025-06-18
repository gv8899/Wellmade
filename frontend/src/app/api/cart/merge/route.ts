import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// 後端 API 基礎 URL
const API_BASE_URL = 'http://localhost:3003';

/**
 * 處理 POST /api/cart/merge 請求 (合併本地購物車到用戶帳號)
 */
export async function POST(request: NextRequest) {
  try {
    // 獲取用戶會話
    const session = await getServerSession(authOptions);
    console.log('API Route - 合併購物車 - 用戶會話:', {
      hasSession: !!session,
      hasBackendToken: !!(session && (session as any).backendToken)
    });

    // 未登入無法合併購物車
    if (!session) {
      return NextResponse.json(
        { error: '您需要登入才能合併購物車' },
        { status: 401 }
      );
    }

    // 解析請求正文
    const body = await request.json();

    // 準備請求選項
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 添加授權標頭
    if (session && (session as any).backendToken) {
      headers.Authorization = `Bearer ${(session as any).backendToken}`;
      console.log('合併購物車 - 使用JWT令牌');
    }

    console.log(`發送合併請求到 ${API_BASE_URL}/cart/merge`, {
      itemCount: body.items?.length || 0
    });

    // 發送請求到後端
    const response = await fetch(`${API_BASE_URL}/cart/merge`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('合併購物車失敗:', response.status, response.statusText);
      // 嘗試讀取錯誤詳情
      let errorDetails = '';
      try {
        const errorData = await response.json();
        errorDetails = JSON.stringify(errorData);
      } catch (e) {
        errorDetails = response.statusText;
      }
      
      return NextResponse.json(
        { error: `後端請求失敗: ${response.status} ${errorDetails}` },
        { status: response.status }
      );
    }

    // 返回後端響應
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('處理合併購物車請求時發生錯誤:', error);
    return NextResponse.json(
      { error: '處理合併購物車請求時發生錯誤', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}
