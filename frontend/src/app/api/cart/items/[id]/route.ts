import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';
import axios from 'axios';

// 後端 API 基礎 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3003';

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

    const session = await getServerSession(authOptions);
    const body = await request.json();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (session && (session as any).backendToken) {
      headers.Authorization = `Bearer ${(session as any).backendToken}`;
      console.log(`更新購物車項目 ${id} - 使用JWT令牌`);
    }

    console.log(`發送PATCH請求到 ${API_BASE_URL}/cart/items/${id}`, body);
    const response = await axios.patch(`${API_BASE_URL}/cart/items/${id}`, body, {
      headers,
      withCredentials: true,
      timeout: 10000,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('處理更新購物車項目請求時發生錯誤:', error);
    
    if (error.response) {
      return NextResponse.json(
        { error: `後端請求失敗: ${error.response.status} ${error.response.statusText}` }, 
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: '處理更新購物車項目請求時發生錯誤' }, 
      { status: 500 }
    );
  }
}

/**
 * 處理 DELETE /api/cart/items/:id 請求 (移除購物車項目)
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
    }

    // 獲取刪除前的購物車狀態（用於記錄）
    try {
      await axios.get(`${API_BASE_URL}/cart`, {
        headers,
        withCredentials: true,
        timeout: 10000,
      });
    } catch (error) {
      console.warn('無法獲取刪除前的購物車狀態:', error);
    }

    console.log(`發送DELETE請求到 ${API_BASE_URL}/cart/items/${id}`);
    await axios.delete(`${API_BASE_URL}/cart/items/${id}`, {
      headers,
      withCredentials: true,
      timeout: 10000,
    });

    // 獲取刪除後的購物車狀態
    try {
      await axios.get(`${API_BASE_URL}/cart`, {
        headers,
        withCredentials: true,
        timeout: 10000,
      });
    } catch (error) {
      console.warn('無法獲取刪除後的購物車狀態:', error);
    }

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    console.error('處理刪除購物車項目請求時發生錯誤:', error);
    
    if (error.response) {
      return NextResponse.json(
        { error: `後端請求失敗: ${error.response.status} ${error.response.statusText}` }, 
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { error: '處理刪除購物車項目請求時發生錯誤' }, 
      { status: 500 }
    );
  }
}