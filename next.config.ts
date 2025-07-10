import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'daftaros-dev.s3.ap-south-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'd2nq6gsuamvat4.cloudfront.net'
      }
    ]
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb'
    }
  }
};

export default nextConfig;
