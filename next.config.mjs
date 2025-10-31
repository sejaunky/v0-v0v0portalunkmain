/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: ['localhost:3000', /\.fly\.dev$/, /\.builder\.io$/],
  },
}

export default nextConfig
