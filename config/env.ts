import { z } from 'zod';

const isBrowser = typeof window !== 'undefined';
const nodeEnv = process.env.NODE_ENV || 'development';
const isProd = nodeEnv === 'production';
const isTest = nodeEnv === 'test';

const apiUrlSchema = z.string().trim().min(1);

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: apiUrlSchema.default('https://api.myrecruiteragency.com'),
});

const serverEnvSchema = z.object({
  API_BASE_URL: apiUrlSchema.default('https://api.myrecruiteragency.com'),
  GOOGLE_CLIENT_ID: z.string().trim().optional(),
  GOOGLE_CLIENT_SECRET: z.string().trim().optional(),
  GOOGLE_REDIRECT_URI: apiUrlSchema.default('https://api.myrecruiteragency.com/google/oauth/callback'),
  SENTRY_DSN: z.string().trim().optional(),
  AWS_REGION: z.string().trim().default('us-west-1'),
  TABLE_NAME: z.string().trim().optional(),
  DYNAMODB_TABLE: z.string().trim().optional(),
  MEDIA_BUCKET: z.string().trim().optional(),
  SESSION_SECRET: z.string().trim().optional(),
  FORMS_SECRET: z.string().trim().optional(),
  CRON_SECRET: z.string().trim().optional(),
  OPENAI_KEY: z.string().trim().optional(),
});

function buildErrors(): string[] {
  const errors: string[] = [];
  const publicResult = publicEnvSchema.safeParse(process.env);
  if (!publicResult.success) {
    errors.push(...publicResult.error.issues.map((issue) => issue.path.join('.') || issue.message));
  }

  if (!isBrowser) {
    const serverResult = serverEnvSchema.safeParse(process.env);
    if (!serverResult.success) {
      errors.push(...serverResult.error.issues.map((issue) => issue.path.join('.') || issue.message));
    }

    if (isProd) {
      const requiredServerKeys = ['GOOGLE_CLIENT_ID', 'GOOGLE_CLIENT_SECRET', 'SESSION_SECRET', 'FORMS_SECRET', 'CRON_SECRET'];
      for (const key of requiredServerKeys) {
        if (!process.env[key]?.trim()) {
          errors.push(`${key} is required in production`);
        }
      }
    }
  }

  return Array.from(new Set(errors));
}

export const env = {
  apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.myrecruiteragency.com',
  serverApiBaseUrl: process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.myrecruiteragency.com',
  googleClientId: process.env.GOOGLE_CLIENT_ID || '',
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || 'https://api.myrecruiteragency.com/google/oauth/callback',
  sentryDsn: process.env.SENTRY_DSN || '',
  awsRegion: process.env.AWS_REGION || 'us-west-1',
  dynamoDbTable: process.env.TABLE_NAME || process.env.DYNAMODB_TABLE || '',
  mediaBucket: process.env.MEDIA_BUCKET || '',
  sessionSecret: process.env.SESSION_SECRET || '',
  formsSecret: process.env.FORMS_SECRET || '',
  cronSecret: process.env.CRON_SECRET || '',
  openAiKey: process.env.OPENAI_KEY || '',
  nodeEnv,
  isDev: nodeEnv === 'development',
  isProd,
  isTest,
  isBrowser,
  isServer: !isBrowser,
} as const;

export function validateEnv(): { valid: boolean; errors: string[] } {
  const errors = buildErrors();
  return { valid: errors.length === 0, errors };
}

export function assertEnv(): void {
  const { valid, errors } = validateEnv();
  if (!valid) {
    throw new Error(`Environment validation failed: ${errors.join('; ')}`);
  }
}

export function getApiBaseUrl(): string {
  return env.apiBaseUrl;
}

export function getServerApiBaseUrl(): string {
  return env.serverApiBaseUrl;
}

export type EnvConfig = typeof env;
