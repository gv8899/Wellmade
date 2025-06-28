import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { UserRole } from '@/types/auth';

// 需要管理員權限的路由
const ADMIN_ROUTES = [
  '/admin',
  '/admin/products',
  '/admin/brands',
  '/admin/users',
  '/admin/dashboard',
];

// 需要認證的路由
const PROTECTED_ROUTES = [
  '/profile',
  '/orders',
  '/admin',
];

export async function middleware(request: NextRequest) {
  // 暫時禁用 middleware 檢查以解決部署環境的時序問題
  console.log('Middleware: Temporarily disabled for debugging');
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (public directory)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|public).*)',
  ],
};