/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async redirects() {
    return [{ source: "/templates", destination: "/resources/templates", permanent: true }]
  },
}

export default nextConfig
