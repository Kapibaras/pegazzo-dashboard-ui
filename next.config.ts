import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    MONOLITH_API_BASE_URL: process.env.MONOLITH_API_BASE_URL,
  },
  async rewrites() {
    const apiUrl = process.env.MONOLITH_API_BASE_URL || 'http://localhost:8000';
    return [
      {
        source: '/api/backend/:path*',
        destination: `${apiUrl}/pegazzo/:path*`,
      },
    ];
  },
  eslint: {
    ignoreDuringBuilds: true, // TODO: Remove this line when all ESLint issues are fixed
  },
};

export default nextConfig;
