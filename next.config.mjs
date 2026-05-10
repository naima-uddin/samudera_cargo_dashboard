/** @type {import('next').NextConfig} */

const isStandaloneBuild = process.env.BUILD_STANDALONE === 'true';

const nextConfig = {
  output: isStandaloneBuild ? 'standalone' : 'export',
  trailingSlash: true,
  
  // Image Optimization - ENABLED
  images: {
    unoptimized: false, // Enable image optimization for faster loading
    formats: ['image/avif', 'image/webp'], // Modern formats
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Cache images for 1 year (in seconds)
    minimumCacheTTL: 31536000,
  },

  // Compression & Performance
  compress: true, // Enable gzip compression
  
  // Swallow SyntaxError when parsing source map
  productionBrowserSourceMaps: false,

  // Experimental features for better performance
  experimental: {
    optimizeCss: true, // Optimize CSS
    optimizePackageImports: [
      'lodash',
      'framer-motion',
      'react-icons',
      '@mui/material',
      '@mui/icons-material',
    ],
  },
};
export default nextConfig;
