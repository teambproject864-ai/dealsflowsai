/** @type {import('next').NextConfig} */
const nextConfig = {
  // Streaming chat + intro effect behave more predictably without double-invoke in dev.
  reactStrictMode: false,
};

export default nextConfig;
