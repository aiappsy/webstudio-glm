import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  // 禁用 Next.js 热重载，由 nodemon 处理重编译
  reactStrictMode: false,
  eslint: {
    // 构建时忽略ESLint错误
    ignoreDuringBuilds: true,
  },
  // Production optimizations for Coolify
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ['@xterm/xterm', 'monaco-editor']
  },
  // Environment variables that should be available in the browser
  env: {
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
  },
  // Add middleware for JWT authentication
  async rewrites() {
      return [
        {
          source: '/api/ai/:path*',
          destination: '/api/ai/:path*',
        },
        {
          source: '/api/ai/:path*',
          destination: '/api/ai/:path*',
        },
      ]
    },
};

export default nextConfig;
