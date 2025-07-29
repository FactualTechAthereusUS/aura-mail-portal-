/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  reactStrictMode: true,
  swcMinify: true,
  
  // Vercel deployment configuration
  output: 'standalone',
  
  // Handle multiple domains
  async rewrites() {
    return [
      // Handle API routes
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },

  // Environment-based configuration
  env: {
    DOMAIN: process.env.DOMAIN || 'aurafarming.co',
    MAIL_DOMAIN: process.env.MAIL_DOMAIN || 'mail.aurafarming.co',
    PORTAL_DOMAIN: process.env.PORTAL_DOMAIN || 'portal.aurafarming.co',
  },

  // Optimize for production
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig 