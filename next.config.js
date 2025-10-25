/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [],
    unoptimized: false,
    qualities: [100, 75],
  },
}

module.exports = nextConfig
