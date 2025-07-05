/** @type {import('next').NextConfig} */

// 從環境變數取得 API URL，預設使用本地開發環境
const apiUrl = process.env.BACKEND_URL || 'http://localhost:3003';

// 解析 API URL 以取得 hostname 和 protocol
const apiUrlParsed = new URL(apiUrl);

const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: process.env.NODE_ENV === 'development',
    domains: ['localhost', '127.0.0.1', 'api.wellmade.select'],
    minimumCacheTTL: 60,
    formats: ['image/webp', 'image/avif'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'drive.google.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3003',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3003',
        pathname: '/uploads/**',
      },
      // 支援後端域名的直接圖片 URL（主流做法）
      {
        protocol: 'https',
        hostname: 'api.wellmade.select',
        port: '',
        pathname: '/uploads/**',
      },
      // 支援後端 ngrok 域名的圖片 URL
      {
        protocol: 'https',
        hostname: '02f0-36-224-76-160.ngrok-free.app',
        port: '',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      // NextAuth 相關路徑不代理（必須在特定路由前面）
      {
        source: '/api/auth/signin',
        destination: '/api/auth/signin',
      },
      {
        source: '/api/auth/signout',
        destination: '/api/auth/signout',
      },
      {
        source: '/api/auth/session',
        destination: '/api/auth/session',
      },
      {
        source: '/api/auth/csrf',
        destination: '/api/auth/csrf',
      },
      {
        source: '/api/auth/callback/:path*',
        destination: '/api/auth/callback/:path*',
      },
      {
        source: '/api/auth/providers',
        destination: '/api/auth/providers',
      },
      // 明確定義需要代理到後端的身份驗證路徑
      {
        source: '/api/auth/login',
        destination: `${apiUrl}/auth/login`, // 代理到 NestJS 的登入 API
      },
      {
        source: '/api/auth/register',
        destination: `${apiUrl}/auth/register`, // 代理到 NestJS 的註冊 API
      },
      // 其他 API 代理到 NestJS
      {
        source: '/api/products/:path*',
        destination: `${apiUrl}/products/:path*`,
      },
      {
        source: '/api/brands/:path*',
        destination: `${apiUrl}/brands/:path*`,
      },
      {
        source: '/api/categories/:path*',
        destination: `${apiUrl}/categories/:path*`,
      },
      {
        source: '/api/cart/:path*',
        destination: `${apiUrl}/cart/:path*`,
      },
      {
        source: '/api/cart',
        destination: `${apiUrl}/cart`,
      },
      {
        source: '/api/admin/:path*',
        destination: `${apiUrl}/admin/:path*`,
      },
      // 註解：/api/uploads/:path* 的代理已移除，使用前端 API 路由處理
      // 可以根據需要添加其他特定的 API 代理
    ];
  },
};

module.exports = nextConfig;
