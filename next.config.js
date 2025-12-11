/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone', // slimmer deploy artifact
  outputFileTracingRoot: __dirname,
};

module.exports = nextConfig;


