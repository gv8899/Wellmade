/** @type {import('next').NextConfig} */
const nextConfig = {
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
      // 其他 API 代理到 NestJS
      {
        source: '/api/:path*',
        destination: 'http://localhost:3003/:path*', // 代理到 NestJS
        has: [
          {
            type: 'header',
            key: 'x-custom-skip-auth',
            value: '(?!)',  // 永遠不匹配的正則表達式
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
