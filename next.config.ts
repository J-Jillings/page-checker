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
  // Force-include files that the nft tracer misses
  outputFileTracingIncludes: {
    '/api/check': [
      './node_modules/playwright-core/browsers.json',
      './node_modules/playwright-core/lib/**/*',
    ],
  },
};

export default nextConfig;
