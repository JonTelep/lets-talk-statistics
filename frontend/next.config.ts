import type { NextConfig } from 'next';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

const nextConfig: NextConfig = {
  reactStrictMode: true,

  // API configuration
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${API_URL}/:path*`,
      },
    ];
  },

  // Image optimization
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
