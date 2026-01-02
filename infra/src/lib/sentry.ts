import * as Sentry from "@sentry/aws-serverless";
import type { Handler as AWSHandler } from "aws-lambda";

// Initialize Sentry for Lambda
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.STAGE || 'prod',
  
  // Performance monitoring
  tracesSampleRate: 1.0,
  
  // Add useful context to errors
  beforeSend(event) {
    // Add Lambda-specific context
    if (process.env.AWS_LAMBDA_FUNCTION_NAME) {
      event.tags = {
        ...event.tags,
        lambda_function: process.env.AWS_LAMBDA_FUNCTION_NAME,
        aws_region: process.env.AWS_REGION,
      };
    }
    return event;
  },
});

export { Sentry };

/**
 * Wraps a Lambda handler with Sentry error tracking and performance monitoring.
 * 
 * Usage:
 * ```ts
 * import { withSentry } from '../lib/sentry';
 * 
 * export const handler = withSentry(async (event) => {
 *   // Your handler code
 * });
 * ```
 */
export function withSentry<T extends AWSHandler>(handler: T): T {
  return Sentry.wrapHandler(handler) as T;
}

/**
 * Capture an error with additional context.
 * 
 * Usage:
 * ```ts
 * import { captureError } from '../lib/sentry';
 * 
 * try {
 *   // risky operation
 * } catch (error) {
 *   captureError(error, { userId: '123', action: 'createClient' });
 *   throw error;
 * }
 * ```
 */
export function captureError(error: unknown, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    extra: context,
  });
}

/**
 * Log a warning or info message to Sentry.
 * 
 * Usage:
 * ```ts
 * import { captureMessage } from '../lib/sentry';
 * 
 * captureMessage('User performed unusual action', 'warning', { userId: '123' });
 * ```
 */
export function captureMessage(
  message: string, 
  level: 'info' | 'warning' | 'error' = 'info',
  context?: Record<string, unknown>
) {
  Sentry.captureMessage(message, {
    level,
    extra: context,
  });
}

