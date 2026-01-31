/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    // Optimized device sizes for responsive images
    deviceSizes: [640, 828, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
    // Enable modern formats (WebP/AVIF) - already default in Next.js 13+
    formats: ['image/webp', 'image/avif'],
    // Optimize image quality for faster loading (80 is a good balance)
    quality: 80,
  },
}

module.exports = nextConfig

