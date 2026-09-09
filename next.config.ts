import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Next's development badge sits in the bottom-left corner, on top of the
  // reader's own controls. It never ships, but it makes the corner of the
  // screen unreadable while the site is being worked on.
  devIndicators: false,
};

export default nextConfig;
