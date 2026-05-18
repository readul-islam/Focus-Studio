/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    optimize: true,
    // unoptimized: false,
  },
  async redirects() {
    return [{ source: "/templates", destination: "/resources/templates", permanent: true }]
  },
}

export default nextConfig
