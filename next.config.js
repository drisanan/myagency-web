const { withSentryConfig } = require("@sentry/nextjs");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  output: 'standalone', // slimmer deploy artifact
  outputFileTracingRoot: __dirname,
};

module.exports = withSentryConfig(nextConfig, {
  // Suppress source map upload logs during build
  silent: true,
  
  // Upload source maps for better stack traces in Sentry
  widenClientFileUpload: true,
  
  // Hide source maps from browser devtools in production
  hideSourceMaps: true,
  
  // Tree-shake Sentry logger statements for smaller bundle
  disableLogger: true,
  
  // Tunnel Sentry events to avoid ad-blockers (optional)
  // tunnelRoute: "/monitoring",
});


