import { NextRequest, NextResponse } from 'next/server';
import { getSession } from 'next-auth/react';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/route';

export async function POST(request: NextRequest) {
  try {
    // 獲取當前用戶的 session
    const session = await getServerSession(authOptions);
    
    if (!session?.backendToken) {
      return NextResponse.json(
        { error: '未找到有效的認證令牌' },
        { status: 401 }
      );
    }

    // 轉發請求到後端 API
    const backendUrl = process.env.BACKEND_URL || 'http://localhost:3003';
    const response = await fetch(`${backendUrl}/cart/force-bind`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.backendToken}`,
        // 轉發原始請求的頭部（如果需要）
        'Cookie': request.headers.get('cookie') || '',
      },
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json(data);
    } else {
      const errorText = await response.text();
      console.error('Backend force-bind failed:', response.status, errorText);
      return NextResponse.json(
        { error: '後端請求失敗' },
        { status: response.status }
      );
    }
  } catch (error) {
    console.error('Force bind cart API error:', error);
    return NextResponse.json(
      { error: '內部伺服器錯誤' },
      { status: 500 }
    );
  }
}