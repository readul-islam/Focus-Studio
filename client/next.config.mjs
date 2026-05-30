import createNextIntlPlugin from 'next-intl/plugin'

// BACKEND_URL: real Django origin used by the server-side proxy and CSP.
// Never expose tokens — this is only for Next.js server → Django server traffic.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

const securityHeaders = [
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy-Report-Only',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline'",
      // Dev traffic goes through /api proxy (same origin). Prod goes to be-stg directly.
      `connect-src 'self' ${apiUrl} https://api.focuspilot.io, https://*.googleapis.com`,
      `img-src 'self' data: blob: https: ${apiUrl}`,
      "font-src 'self'",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

/** @type {import('next').NextConfig} */
const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "techstyles.s3.amazonaws.com",
      },
      {
        protocol: "https",
        hostname: "techstyles.s3.eu-west-2.amazonaws.com",
      }
    ],
  },
  webpack: (config) => {
    config.resolve.alias.canvas = false;
    config.resolve.alias.encoding = false;
    return config;
  },
}

const withNextIntl = createNextIntlPlugin('./i18n/request.ts')

export default withNextIntl(nextConfig)
