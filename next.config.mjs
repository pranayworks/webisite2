/** @type {import('next').NextConfig} */
const nextConfig = {
  // Only export for Capacitor builds
  output: process.env.IS_CAPACITOR === 'true' ? 'export' : undefined,
  trailingSlash: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
