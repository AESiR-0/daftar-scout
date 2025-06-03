import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    domains: [
      "lh3.googleusercontent.com",
      "res.cloudinary.com"
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    }
  }
};

export default nextConfig;
