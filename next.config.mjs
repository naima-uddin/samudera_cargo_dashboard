/** @type {import('next').NextConfig} */

const nextConfig = {
  output: 'export', // Static export mode
  trailingSlash: true,
  
  // Image Optimization - DISABLED for production
  images: {
    unoptimized: true, // Required for middleware compatibility
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
