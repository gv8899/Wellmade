import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

// 後端 API 基礎 URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:3003';

/**
 * 處理 GET /api/brands/[id] 請求
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // 準備請求選項
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // 構建完整的後端 URL
    const backendUrl = `${API_BASE_URL}/brands/${id}`;
    
    console.log('代理單個品牌請求到:', backendUrl);

    // 發送請求到後端
    const response = await axios.get(backendUrl, {
      headers,
      timeout: 10000,
    });

    // 返回後端響應
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('單個品牌API路由錯誤:', error);
    return NextResponse.json(
      { error: '處理單個品牌請求時發生錯誤' }, 
      { status: 500 }
    );
  }
}