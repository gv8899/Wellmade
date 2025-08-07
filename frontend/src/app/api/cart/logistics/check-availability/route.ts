import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3003';

// POST /api/cart/logistics/check-availability - 檢查購物車配送可用性
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch(`${BACKEND_URL}/api/cart/logistics/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { 
          error: '檢查配送可用性失敗',
          details: errorText 
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('購物車配送檢查 API 錯誤:', error);
    return NextResponse.json(
      { 
        error: '服務暫時不可用', 
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}