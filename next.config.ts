import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: { bodySizeLimit: '50mb' },
  },
  serverExternalPackages: [
    'playwright-core',
    'steel-sdk',
    'pixelmatch',
    'pngjs',
  ],
};

export default nextConfig;
