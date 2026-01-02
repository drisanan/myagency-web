import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  
  // Environment tracking
  environment: process.env.NODE_ENV,
  
  // Performance Monitoring
  tracesSampleRate: 1.0,
  
  // Capture unhandled promise rejections
  integrations: [
    Sentry.captureConsoleIntegration({
      levels: ['error', 'warn'],
    }),
  ],
});

