import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إعدادات للتعامل مع API
  async rewrites() {
    // في الإنتاج، استخدم متغير البيئة
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

    return [
      {
        source: "/api/:path*",
        destination: `${apiUrl}/:path*`,
      },
    ];
  },

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
};

export default nextConfig;
