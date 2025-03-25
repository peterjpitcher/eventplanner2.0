/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Enable server actions (if needed in the app)
    serverActions: true
  }
};

module.exports = nextConfig; 