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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
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
      console.log(`Session詳情:`, {
        hasSession: !!session,
        hasBackendToken: !!(session as any).backendToken,
        email: session.user?.email,
        tokenLength: ((session as any).backendToken || '').length
      });
    } else {
      console.log(`刪除購物車項目 ${id} - 無有效認證`);
    }

    console.log(`發送DELETE請求到 ${API_BASE_URL}/cart/items/${id}`, { headers });
    
    // 先檢查刪除前的購物車狀態
    try {
      const preDeleteResponse = await fetch(`${API_BASE_URL}/cart`, {
        method: 'GET',
        headers,
        credentials: 'include',
      });
      if (preDeleteResponse.ok) {
        const preDeleteData = await preDeleteResponse.json();
        console.log(`[PRE-DELETE] 購物車狀態:`, {
          itemCount: preDeleteData.items?.length || 0,
          items: preDeleteData.items?.map((item: any) => ({
            id: item.id,
            name: item.name,
            quantity: item.quantity
          })) || []
        });
      }
    } catch (e) {
      console.log('[PRE-DELETE] 無法獲取刪除前狀態');
    }
    
    const response = await fetch(`${API_BASE_URL}/cart/items/${id}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
    });

    console.log(`後端DELETE響應:`, {
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
      headers: Object.fromEntries(response.headers.entries())
    });

    // 讀取響應體（如果有的話）
    let responseBody = '';
    try {
      responseBody = await response.text();
      console.log(`後端響應體:`, responseBody);
    } catch (e) {
      console.log('無法讀取響應體');
    }
    
    // 檢查刪除後的購物車狀態
    if (response.ok) {
      try {
        const postDeleteResponse = await fetch(`${API_BASE_URL}/cart`, {
          method: 'GET',
          headers,
          credentials: 'include',
        });
        if (postDeleteResponse.ok) {
          const postDeleteData = await postDeleteResponse.json();
          console.log(`[POST-DELETE] 購物車狀態:`, {
            itemCount: postDeleteData.items?.length || 0,
            items: postDeleteData.items?.map((item: any) => ({
              id: item.id,
              name: item.name,
              quantity: item.quantity
            })) || []
          });
        }
      } catch (e) {
        console.log('[POST-DELETE] 無法獲取刪除後狀態');
      }
    }

    if (!response.ok) {
      console.error(`刪除購物車項目 ${id} 失敗:`, response.status, response.statusText);
      console.error(`響應內容:`, responseBody);
      return NextResponse.json(
        { error: `後端請求失敗: ${response.status} ${response.statusText}` }, 
        { status: response.status }
      );
    }

    console.log(`刪除成功，返回204`);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('刪除購物車項目請求錯誤:', error);
    return NextResponse.json(
      { error: '處理刪除購物車項目請求時發生錯誤' }, 
      { status: 500 }
    );
  }
}
