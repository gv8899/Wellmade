import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/route';

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:3003';

// GET /api/products/[id]/logistics - 獲取產品物流配置
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const productId = params.id;
    
    const response = await fetch(`${BACKEND_URL}/products/${productId}/logistics`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { 
          error: '獲取產品物流配置失敗',
          details: errorText 
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('產品物流配置 API 錯誤:', error);
    return NextResponse.json(
      { 
        error: '服務暫時不可用', 
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}

// PATCH /api/products/[id]/logistics - 更新產品物流配置 (需要管理員權限)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // 檢查用戶認證和權限
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: '需要登入' }, { status: 401 });
    }

    // 檢查管理員權限
    if (session.user.role !== 'admin') {
      return NextResponse.json({ error: '需要管理員權限' }, { status: 403 });
    }

    const productId = params.id;
    const logisticsConfig = await request.json();

    const response = await fetch(`${BACKEND_URL}/products/${productId}/logistics`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.accessToken}`,
      },
      body: JSON.stringify(logisticsConfig),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Backend API error: ${response.status} - ${errorText}`);
      return NextResponse.json(
        { 
          error: '更新產品物流配置失敗',
          details: errorText 
        }, 
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('更新產品物流配置 API 錯誤:', error);
    return NextResponse.json(
      { 
        error: '服務暫時不可用', 
        message: error.message 
      }, 
      { status: 500 }
    );
  }
}