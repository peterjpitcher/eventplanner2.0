/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Enable optimizations for client components
    missingSuspenseWithCSRErrorEnabled: false,
    // Enable server actions (if needed in the app)
    serverActions: true
  }
};

module.exports = nextConfig; 