import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    allowedDevOrigins: ['cold-pants-beam.loca.lt'],
  },
};

export default nextConfig;