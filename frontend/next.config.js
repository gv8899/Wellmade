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
      // 支援生產環境的圖片上傳
      {
        protocol: apiUrlParsed.protocol.replace(':', ''),
        hostname: apiUrlParsed.hostname,
        port: apiUrlParsed.port || '',
        pathname: '/uploads/**',
      },
    ],
  },
  async rewrites() {
    return [
      // 明確定義需要代理到後端的身份驗證路徑
      {
        source: '/api/auth/login',
        destination: `${apiUrl}/auth/login`, // 代理到 NestJS 的登入 API
      },
      {
        source: '/api/auth/register',
        destination: `${apiUrl}/auth/register`, // 代理到 NestJS 的註冊 API
      },
      // NextAuth 相關路徑不代理
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
      // 特別為 NextAuth 路由設置
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',  // 不代理 NextAuth 路由
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
      {
        source: '/api/uploads/:path*',
        destination: `${apiUrl}/uploads/:path*`,
      },
      // 可以根據需要添加其他特定的 API 代理
    ];
  },
};

module.exports = nextConfig;
