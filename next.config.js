/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['your-supabase-domain.supabase.co'],
  },
  output: 'standalone',
  // Force all pages to be server-side rendered (no static optimization)
  experimental: {
    missingSuspenseWithCSRError: false,
  }
};

module.exports = nextConfig; 