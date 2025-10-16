import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: {
    MONOLITH_API_BASE_URL: process.env.MONOLITH_API_BASE_URL,
  },
  eslint: {
    ignoreDuringBuilds: true, // TODO: Remove this line when all ESLint issues are fixed
  },
};

export default nextConfig;
