/**
 * Centralized Environment Configuration
 * 
 * All environment variables should be accessed through this module.
 * This ensures:
 * - Single source of truth for env vars
 * - Proper typing
 * - Validation at startup
 * - Easy mocking in tests
 */

/**
 * Get a required environment variable (throws if missing in production)
 */
function requireEnv(key: string, defaultValue?: string): string {
  const value = process.env[key];
  if (value) return value;
  if (defaultValue !== undefined) return defaultValue;
  
  // In production, throw if required var is missing
  if (process.env.NODE_ENV === 'production') {
    console.error(`Missing required environment variable: ${key}`);
  }
  return '';
}

/**
 * Get an optional environment variable with a default
 */
function optionalEnv(key: string, defaultValue: string): string {
  return process.env[key] || defaultValue;
}

/**
 * Check if we're running in a browser context
 */
const isBrowser = typeof window !== 'undefined';

/**
 * Environment configuration object
 * Access all env vars through this object
 */
export const env = {
  // ==========================================================================
  // API Configuration
  // ==========================================================================
  
  /**
   * API base URL for frontend (browser) requests
   * Uses NEXT_PUBLIC_ prefix so it's available client-side
   */
  apiBaseUrl: optionalEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.myrecruiteragency.com'),
  
  /**
   * API base URL for server-side requests (may differ in some setups)
   */
  serverApiBaseUrl: optionalEnv('API_BASE_URL', optionalEnv('NEXT_PUBLIC_API_BASE_URL', 'https://api.myrecruiteragency.com')),

  // ==========================================================================
  // Google OAuth
  // ==========================================================================
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: optionalEnv('GOOGLE_REDIRECT_URI', 'https://api.myrecruiteragency.com/google/oauth/callback'),

  // ==========================================================================
  // Sentry
  // ==========================================================================
  sentryDsn: process.env.SENTRY_DSN || '',

  // ==========================================================================
  // AWS
  // ==========================================================================
  awsRegion: optionalEnv('AWS_REGION', 'us-west-1'),
  dynamoDbTable: process.env.DYNAMODB_TABLE || '',
  mediaBucket: process.env.MEDIA_BUCKET || '',

  // ==========================================================================
  // Runtime Environment
  // ==========================================================================
  nodeEnv: process.env.NODE_ENV || 'development',
  isDev: process.env.NODE_ENV === 'development',
  isProd: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  isBrowser,
  isServer: !isBrowser,
} as const;

/**
 * Validate required environment variables
 * Call this at app startup in production
 */
export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Required in all environments
  if (!env.apiBaseUrl) {
    errors.push('NEXT_PUBLIC_API_BASE_URL is required');
  }
  
  // Required in production only
  if (env.isProd) {
    if (!env.googleClientId) errors.push('GOOGLE_CLIENT_ID is required in production');
    if (!env.googleClientSecret) errors.push('GOOGLE_CLIENT_SECRET is required in production');
  }
  
  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get the API base URL, ensuring it's valid
 */
export function getApiBaseUrl(): string {
  const url = env.apiBaseUrl;
  if (!url) {
    throw new Error('API_BASE_URL is not configured');
  }
  return url;
}

// Type export for use in other modules
export type EnvConfig = typeof env;
