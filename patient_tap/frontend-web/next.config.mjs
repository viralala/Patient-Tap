/** @type {import('next').NextConfig} */
const nextConfig = {
  // Frontend-only build; lint is run separately so it never blocks the demo build.
  eslint: { ignoreDuringBuilds: true },
  reactStrictMode: true,
};

export default nextConfig;
