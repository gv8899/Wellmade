import { NextRequest, NextResponse } from 'next/server';
import { buildBackendUrl } from '@/utils/api-config';

/**
 * 處理 GET /api/uploads/[filename] 請求
 * 代理圖片請求，解決跨域問題
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // 構建完整的後端圖片 URL
    const backendUrl = buildBackendUrl(`uploads/${filename}`);
    
    console.log('代理圖片請求到:', backendUrl);

    // 從後端獲取圖片
    const response = await fetch(backendUrl, {
      method: 'GET',
      cache: 'force-cache', // 啟用緩存以提升效能
    });

    if (!response.ok) {
      console.error('後端圖片請求失敗:', response.status, response.statusText);
      return NextResponse.json(
        { error: 'Image not found' },
        { status: 404 }
      );
    }

    // 獲取圖片資料
    const imageBuffer = await response.arrayBuffer();
    
    // 獲取原始的 Content-Type
    const contentType = response.headers.get('content-type') || 'image/jpeg';
    
    // 返回圖片響應，並設置適當的標頭
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // 1 天緩存
        'CDN-Cache-Control': 'public, max-age=31536000', // CDN 緩存 1 年
      },
    });
  } catch (error) {
    console.error('圖片代理錯誤:', error);
    return NextResponse.json(
      { 
        error: '處理圖片請求時發生錯誤',
        details: error.message,
        filename: params.filename
      }, 
      { status: 500 }
    );
  }
}