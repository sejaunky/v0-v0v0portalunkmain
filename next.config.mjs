/** @type {import('next').NextConfig} */
const nextConfig = {
  turbopack: {},
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  allowedOrigins: ['localhost:3000', /\.fly\.dev$/, /\.builder\.io$/, /localhost/],
}

export default nextConfig
