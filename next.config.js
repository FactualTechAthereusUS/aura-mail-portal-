/** @type {import('next').NextConfig} */
const nextConfig = {
  // Optimized for Vercel deployment
  output: 'standalone',
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable static optimization for better performance
  images: {
    unoptimized: true
  },
  
  // Configure for frontend-only deployment
  trailingSlash: false,
  
  // Headers for CORS and security
  async headers() {
    return [
      {
        source: '/:path*',
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
        ],
      },
    ]
  },

  // Rewrites for API calls (proxy to DigitalOcean)
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://portal.aurafarming.co/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig 