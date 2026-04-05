/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🔹 Вариант А: Отключить standalone (проще для обычного сервера)
  // output: 'standalone',  // ← Закомментируйте эту строку!
  
  // 🔹 Вариант Б: Если оставляете standalone — запускайте через:
  // node .next/standalone/server.js  (а не next start!)
  
  reactStrictMode: false,
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: true },
  
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
  },
  
  // 🔹 Проксирование API-запросов на Django-бэкенд
  async rewrites() {
    return [
      // Исключаем API routes Next.js (sitemap.xml, robots.txt)
      {
        source: '/api/sitemap.xml',
        destination: '/api/sitemap.xml', // остаётся на Next.js
      },
      {
        source: '/api/robots.txt',
        destination: '/api/robots.txt', // остаётся на Next.js
      },
      // Всё остальное → Django
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL || 'http://127.0.0.1:8000'}/api/:path*`,
      },
    ];
  },
  
  // 🔹 Переменные окружения (без дефолтов, чтобы брать из .env.local)
  env: {
    API_URL: process.env.API_URL,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  },
};

module.exports = nextConfig;