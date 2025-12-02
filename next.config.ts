import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["imagedelivery.net"],
  },
  async redirects() {
    return [
      {
        source: "/",
        destination: "/bridge",
        permanent: false,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
