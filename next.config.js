/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  turbopack: {
    // Explicitly set the project root for Turbopack to avoid incorrect inference
    root: __dirname
  }
};

module.exports = nextConfig;


