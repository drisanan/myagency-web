import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  
  // Environment tracking
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring - capture 100% of transactions
  // Lower this in production for high-traffic apps (e.g., 0.1 for 10%)
  tracesSampleRate: 1.0,
  
  // Session Replay for debugging UI issues
  replaysSessionSampleRate: 0.1, // 10% of sessions
  replaysOnErrorSampleRate: 1.0, // 100% of sessions with errors
  
  integrations: [
    Sentry.replayIntegration({
      maskAllText: false,
      blockAllMedia: false,
    }),
    Sentry.browserTracingIntegration(),
  ],
  
  // Filter out noisy errors
  ignoreErrors: [
    // Browser extensions
    /^chrome-extension:\/\//,
    /^moz-extension:\/\//,
    // Network errors that are expected
    "Network request failed",
    "Failed to fetch",
    // User-cancelled navigation
    "AbortError",
  ],
});

