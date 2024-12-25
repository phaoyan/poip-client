import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard', // 将 "/" 跳转到这里
        permanent: true, // 或 false，取决于需求
      },
    ];
  },
};

export default nextConfig;
