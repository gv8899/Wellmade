import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

// 後端 API 基礎 URL
const API_BASE_URL = 'http://localhost:3003';

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
    const response = await fetch(`${API_BASE_URL}/cart/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      console.error('添加購物車項目失敗:', response.status, response.statusText);
      return NextResponse.json(
        { error: `後端請求失敗: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    // 返回後端響應
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('處理添加購物車項目請求時發生錯誤:', error);
    return NextResponse.json(
      { error: '處理添加購物車項目請求時發生錯誤' }, 
      { status: 500 }
    );
  }
}

/**
 * 處理 PATCH /api/cart/items/:id 請求 (更新購物車項目數量)
 */
export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = params.id;
    const body = await request.json();
    const session = await getServerSession(authOptions);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session && (session as any).backendToken) {
      headers.Authorization = `Bearer ${(session as any).backendToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/cart/items/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `後端請求失敗: ${response.status}` }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('更新購物車項目請求錯誤:', error);
    return NextResponse.json(
      { error: '處理更新購物車項目請求時發生錯誤' }, 
      { status: 500 }
    );
  }
}

/**
 * 處理 DELETE /api/cart/items/:id 請求 (刪除購物車項目)
 */
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const id = request.nextUrl.searchParams.get('id');
    if (!id) {
      return NextResponse.json(
        { error: '缺少項目ID' }, 
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };
    
    if (session && (session as any).backendToken) {
      headers.Authorization = `Bearer ${(session as any).backendToken}`;
    }

    const response = await fetch(`${API_BASE_URL}/cart/items/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `後端請求失敗: ${response.status}` }, 
        { status: response.status }
      );
    }

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('刪除購物車項目請求錯誤:', error);
    return NextResponse.json(
      { error: '處理刪除購物車項目請求時發生錯誤' }, 
      { status: 500 }
    );
  }
}
