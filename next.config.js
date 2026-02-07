/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Optimized device sizes for responsive images
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    // Enable modern formats (WebP/AVIF) - already default in Next.js 13+
    formats: ['image/webp', 'image/avif'],
    // Set minimum cache TTL to 0 for development to always show latest images
    minimumCacheTTL: 0,
  },
}

module.exports = nextConfig

