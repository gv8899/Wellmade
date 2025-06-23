/** @type {import('next').NextConfig} */
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
    ],
  },
  async rewrites() {
    return [
      // 明確定義需要代理到後端的身份驗證路徑
      {
        source: '/api/auth/login',
        destination: 'http://localhost:3003/auth/login', // 代理到 NestJS 的登入 API
      },
      {
        source: '/api/auth/register',
        destination: 'http://localhost:3003/auth/register', // 代理到 NestJS 的註冊 API
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
      // 其他 API 代理到 NestJS (排除 auth 和 cart，使用 Next.js API 路由)
      {
        source: '/api/products/:path*',
        destination: 'http://localhost:3003/products/:path*',
      },
      {
        source: '/api/brands/:path*',
        destination: 'http://localhost:3003/brands/:path*',
      },
      // 可以根據需要添加其他特定的 API 代理
    ];
  },
};

module.exports = nextConfig;
