import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  reactCompiler: true,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org'
      },
      {
        protocol: 'https',
        hostname: 'content.sportslogos.net'
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com'
      }
    ]
  }
}

export default nextConfig
