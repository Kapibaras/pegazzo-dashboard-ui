import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone',
  eslint: {
    ignoreDuringBuilds: true, // TODO: Remove this line when all ESLint issues are fixed
  },
};

export default nextConfig;
