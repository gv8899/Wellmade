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
  const { pathname } = request.nextUrl;
  
  // 排除不需要檢查的路由
  const excludedPaths = ['/admin-login', '/login', '/api', '/_next', '/favicon.ico'];
  const shouldSkip = excludedPaths.some(path => pathname.startsWith(path));
  
  if (shouldSkip) {
    return NextResponse.next();
  }
  
  // 檢查是否為受保護的路由
  const isProtectedRoute = PROTECTED_ROUTES.some(route => 
    pathname.startsWith(route)
  );
  
  const isAdminRoute = ADMIN_ROUTES.some(route => 
    pathname.startsWith(route)
  );

  if (isProtectedRoute) {
    // 獲取 NextAuth JWT token
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    });

    // 如果沒有 token，重定向到登入頁面
    if (!token) {
      console.log('Middleware: No token found, redirecting to login for:', pathname);
      const loginUrl = new URL('/admin-login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // 如果是管理員路由，檢查角色權限
    if (isAdminRoute) {
      // 從 token 中獲取 backendToken
      const backendToken = (token as any).backendToken;
      
      if (backendToken) {
        try {
          // 解析 JWT token 獲取角色
          const base64Url = backendToken.split('.')[1];
          const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
          const jsonPayload = decodeURIComponent(
            atob(base64)
              .split('')
              .map((c: string) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
              .join('')
          );
          
          const payload = JSON.parse(jsonPayload);
          const userRoles: UserRole[] = payload.roles || [];
          
          // 檢查是否有管理員權限
          if (!userRoles.includes(UserRole.ADMIN)) {
            // 沒有權限，重定向到首頁
            return NextResponse.redirect(new URL('/', request.url));
          }
        } catch (error) {
          console.error('Failed to parse JWT in middleware:', error);
          // JWT 解析失敗，重定向到登入頁面
          return NextResponse.redirect(new URL('/login', request.url));
        }
      } else {
        // 沒有 backend token，重定向到登入頁面
        console.log('No backend token found, redirecting to admin-login');
        return NextResponse.redirect(new URL('/admin-login', request.url));
      }
    }
  }

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