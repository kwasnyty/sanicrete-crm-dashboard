import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Enable static export for GitHub Pages
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // Base path for GitHub Pages deployment
  basePath: process.env.NODE_ENV === 'production' ? '/sanicrete-crm-dashboard' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/sanicrete-crm-dashboard/' : '',
};

export default nextConfig;