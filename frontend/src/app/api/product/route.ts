import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 後端 API 基礎 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3003';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json(
        { error: '產品ID是必需的' },
        { status: 400 }
      );
    }
    
    const backendUrl = `${API_BASE_URL}/products/${id}`;
    console.log('代理單個產品請求到:', backendUrl);

    const response = await axios.get(backendUrl, {
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000,
    });

    return NextResponse.json(response.data);
  } catch (error: any) {
    console.error('單個產品API路由錯誤:', error);
    
    if (error.response) {
      return NextResponse.json(
        { 
          error: '後端請求失敗',
          details: error.message,
          status: error.response.status
        }, 
        { status: error.response.status }
      );
    }
    
    return NextResponse.json(
      { 
        error: '處理單個產品請求時發生錯誤',
        details: error.message
      }, 
      { status: 500 }
    );
  }
}