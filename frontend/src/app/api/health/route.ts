import { NextResponse } from 'next/server';

/**
 * 健康檢查端點
 * GET /api/health
 */
export async function GET() {
  try {
    // 簡單的健康檢查
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    };
    
    return NextResponse.json(health, { status: 200 });
  } catch (error) {
    console.error('健康檢查失敗:', error);
    
    return NextResponse.json(
      { 
        status: 'unhealthy', 
        error: error instanceof Error ? error.message : '未知錯誤',
        timestamp: new Date().toISOString()
      }, 
      { status: 500 }
    );
  }
}