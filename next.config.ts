import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optimized for Vercel deployment
  images: {
    unoptimized: true,
  },
  // No basePath needed for Vercel
  trailingSlash: false,
};

export default nextConfig;