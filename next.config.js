const isExport = process.env.OUTPUT_EXPORT === 'true';
const isProd = process.env.NODE_ENV === 'production';
const basePath = isExport ? '/princess-day-website' : '';

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  compress: true,
  basePath,
  assetPrefix: isExport ? '/princess-day-website/' : undefined,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: isExport,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 60,
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  ...(isExport
    ? {
        output: 'export',
      }
    : {
        async headers() {
          if (!isProd) {
            return [
              {
                source: '/:path*',
                headers: [
                  {
                    key: 'Cache-Control',
                    value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
                  },
                  {
                    key: 'Pragma',
                    value: 'no-cache',
                  },
                  {
                    key: 'Expires',
                    value: '0',
                  },
                ],
              },
            ];
          }
          return [
            {
              source: '/_next/static/:path*',
              headers: [
                {
                  key: 'Cache-Control',
                  value: 'public, max-age=31536000, immutable',
                },
              ],
            },
            {
              source: '/(.*)',
              headers: [
                {
                  key: 'X-Content-Type-Options',
                  value: 'nosniff',
                },
                {
                  key: 'X-Frame-Options',
                  value: 'DENY',
                },
                {
                  key: 'X-XSS-Protection',
                  value: '1; mode=block',
                },
                {
                  key: 'Referrer-Policy',
                  value: 'strict-origin-when-cross-origin',
                },
              ],
            },
          ];
        },
      }),
};

module.exports = nextConfig;
