import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

// 後端 API 基礎 URL
const API_BASE_URL = 'http://localhost:3003';

/**
 * 處理 PATCH /api/cart/items/:id 請求 (更新購物車項目數量)
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    if (!id) {
      return NextResponse.json(
        { error: '缺少項目ID' }, 
        { status: 400 }
      );
    }
    
    // 解析請求正文
    const body = await request.json();
    const session = await getServerSession(authOptions);

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session && (session as any).backendToken) {
      headers.Authorization = `Bearer ${(session as any).backendToken}`;
      console.log(`更新購物車項目 ${id} - 使用JWT令牌`);
    }

    console.log(`發送PATCH請求到 ${API_BASE_URL}/cart/items/${id}`, body);
    const response = await fetch(`${API_BASE_URL}/cart/items/${id}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`更新購物車項目 ${id} 失敗:`, response.status, response.statusText);
      return NextResponse.json(
        { error: `後端請求失敗: ${response.status} ${response.statusText}` }, 
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
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
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
      console.log(`刪除購物車項目 ${id} - 使用JWT令牌`);
    }

    console.log(`發送DELETE請求到 ${API_BASE_URL}/cart/items/${id}`);
    const response = await fetch(`${API_BASE_URL}/cart/items/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      console.error(`刪除購物車項目 ${id} 失敗:`, response.status, response.statusText);
      return NextResponse.json(
        { error: `後端請求失敗: ${response.status} ${response.statusText}` }, 
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
