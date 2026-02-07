// next.config.ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,

  images: {
    remotePatterns: [
      // 1. Your server IP (for old local images)
      {
        protocol: "http",
        hostname: "193.203.161.174",
        port: "3007",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "193.203.161.174",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "grodify.com",
        pathname: "/uploads/**",
      },

      // 2. Your S3 bucket
      {
        protocol: "https",
        hostname: "flyer-app-bucket-2025.s3.ap-southeast-2.amazonaws.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.s3.ap-southeast-2.amazonaws.com",
        pathname: "/**",
      },

      // 3. Unsplash (you already use)
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "plus.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "unsplash.com",
      },
    ],
  },
};

export default nextConfig;