/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  async redirects() {
    return [{ source: "/templates", destination: "/resources/templates", permanent: true }]
  },
}

export default nextConfig
