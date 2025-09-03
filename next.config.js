/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_GEMINI_API_KEY: process.env.NEXT_PUBLIC_GEMINI_API_KEY,
  },
  images: {
    domains: [],
  },
  // Performans optimizasyonları
  compress: true,
  poweredByHeader: false,
}

module.exports = nextConfig
