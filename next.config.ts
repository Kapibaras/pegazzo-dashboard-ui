import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    MONOLITH_API_BASE_URL: process.env.MONOLITH_API_BASE_URL,
  },
};

export default nextConfig;
