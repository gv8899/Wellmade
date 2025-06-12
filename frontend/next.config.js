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
      // 特別對 NextAuth 路徑設置
      {
        source: '/api/auth/:path*',
        destination: '/api/auth/:path*',  // 不代理 NextAuth 路徑
      },
    ];
  },
};

module.exports = nextConfig;
