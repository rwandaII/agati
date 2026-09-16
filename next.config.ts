import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // dev badge sits bottom-left, right on top of the reader controls
  devIndicators: false,
  images: {
    // the portraits and the comic plates ask for these; next 16 wants them
    // declared up front or it warns on every render
    qualities: [90, 92, 95],
  },
};

export default nextConfig;
