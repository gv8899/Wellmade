import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3003';

export async function GET(request: NextRequest) {
  try {
    const response = await fetch(`${BACKEND_URL}/article-categories`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Backend responded with status: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching article categories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch article categories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // 🚧 開發模式：暫時繞過認證檢查
    const session = await getServerSession(authOptions);
    
    // if (!session?.user?.id) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    // }

    // 獲取請求數據
    const body = await request.json();
    
    // 轉發到後端 API (暫時移除認證 header)
    const response = await fetch(`${BACKEND_URL}/article-categories`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${session?.backendToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Backend create category error:', errorText);
      return NextResponse.json(
        { error: 'Failed to create category', details: errorText }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error('Create category API error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' }, 
      { status: 500 }
    );
  }
}