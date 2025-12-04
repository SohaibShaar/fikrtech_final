import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // تحسينات للإنتاج
  reactStrictMode: true,

  // السماح بالصور من أي نطاق (يمكن تخصيصه حسب الحاجة)
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },

  // تفعيل الضغط
  compress: true,

  // Ignore ESLint and TypeScript errors during build
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },

  // إعدادات إضافية
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
