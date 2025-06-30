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
  const pathname = request.nextUrl.pathname;
  
  // 檢查是否為需要保護的路由
  const isProtectedRoute = PROTECTED_ROUTES.some(route => pathname.startsWith(route));
  const isAdminRoute = ADMIN_ROUTES.some(route => pathname.startsWith(route));
  
  // 如果不是保護路由，直接放行
  if (!isProtectedRoute) {
    return NextResponse.next();
  }

  try {
    // 獲取 token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
    
    console.log('Middleware: Checking route', { 
      pathname, 
      isProtectedRoute, 
      isAdminRoute, 
      hasToken: !!token,
      roles: token?.roles || []
    });

    // 如果沒有 token，記錄但不重定向（讓頁面級保護處理）
    if (!token) {
      console.log('Middleware: No token found, allowing page-level protection to handle');
      // 暫時允許通過，讓頁面級的 RequireAuth 組件處理
      return NextResponse.next();
    }

    // 如果是管理員路由，檢查角色
    if (isAdminRoute) {
      const userRoles = (token.roles as string[]) || [];
      const hasAdminRole = userRoles.includes(UserRole.ADMIN);
      
      if (!hasAdminRole) {
        console.log('Middleware: User lacks admin role, redirecting to home');
        return NextResponse.redirect(new URL('/', request.url));
      }
    }

    // 所有檢查通過，放行
    return NextResponse.next();
    
  } catch (error) {
    console.error('Middleware error:', error);
    // 發生錯誤時，為了避免阻塞用戶，直接放行
    // 頁面級的 RequireAuth 組件會進行二次檢查
    return NextResponse.next();
  }
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