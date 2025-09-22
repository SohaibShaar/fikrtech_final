import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // إعدادات للتعامل مع API
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: "http://localhost:5000/api/:path*",
      },
    ];
  },
};

export default nextConfig;
