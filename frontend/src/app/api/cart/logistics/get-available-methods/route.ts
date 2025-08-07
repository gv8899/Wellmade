import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3003';

// POST /api/cart/logistics/get-available-methods - 獲取可用配送方式
export async function POST(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/api/cart/logistics/get-available-methods`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { 
          error: '獲取配送方式失敗',
          details: errorText 
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('獲取配送方式 API 錯誤:', error);
    return NextResponse.json(
      { 
        error: '服務暫時不可用', 
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}