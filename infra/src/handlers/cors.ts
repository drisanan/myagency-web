import { getApiBaseUrl } from '@/config/env';
import { isDynamicallyAllowedOrigin } from '../lib/dynamicOrigins';

const envOrigins = (process.env.WEB_APP_ORIGINS || process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const ALLOWED_ORIGINS = [
  'https://master.d2yp6hyv6u0efd.amplifyapp.com',
  'https://myrecruiteragency.com',
  'https://www.myrecruiteragency.com',
  'https://app.myrecruiteragency.com',
  ...envOrigins,
  getApiBaseUrl(),
];

/**
 * We own the entire `myrecruiteragency.com` DNS zone, so any subdomain
 * served from it is by definition ours (pilot / tenant hosts like
 * `11.myrecruiteragency.com`). Recognize it without a DB round-trip.
 */
const OWNED_ROOT = 'myrecruiteragency.com';
export function isOwnedZoneOrigin(origin: string): boolean {
  if (!origin.startsWith('https://')) return false;
  const host = origin.slice('https://'.length).split('/')[0].toLowerCase();
  return host === OWNED_ROOT || host.endsWith(`.${OWNED_ROOT}`);
}

export function isAllowedOrigin(origin?: string | null): origin is string {
  if (!origin) return false;
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  if (isOwnedZoneOrigin(origin)) return true;
  return false;
}

/**
 * Phase 5c: on handlers exposed to external customer domains (non-owned),
 * prefer `resolveCorsOrigin` (async) over calling `buildCors` directly. It
 * unions the static allowlist + owned-zone check above with any ACTIVE
 * `DOMAIN#<hostname>` row in DynamoDB.
 */
export async function resolveCorsOrigin(origin?: string): Promise<string | null> {
  if (!origin) return null;
  if (isAllowedOrigin(origin)) return origin;
  if (await isDynamicallyAllowedOrigin(origin)) return origin;
  return null;
}

export function buildCors(origin?: string, trustOrigin = false) {
  const allow =
    origin && (trustOrigin || isAllowedOrigin(origin))
      ? origin
      : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Credentials': 'true',
    // Include X-Local-Set-Cookie in exposed headers so frontend can read it
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Expose-Headers': 'X-Local-Set-Cookie',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  };
}

export function response(
  statusCode: number,
  body: unknown,
  origin?: string,
  extraHeaders?: Record<string, string>,
  cookies?: string[],
  trustOrigin = false,
) {
  const cors = buildCors(origin, trustOrigin);
  const isLocal = origin?.includes('localhost');
  // Strip any set-cookie from extraHeaders (we handle cookies separately)
  const { 'set-cookie': _, 'Set-Cookie': __, ...cleanHeaders } = extraHeaders || {};
  
  const res: Record<string, unknown> = {
    statusCode,
    headers: { ...cors, ...cleanHeaders } as Record<string, string>,
    body: JSON.stringify(body),
  };

  if (cookies && cookies.length > 0) {
    if (isLocal) {
      // LOCAL DEV: Use custom header to bypass Hapi's strict cookie validation
      // Frontend will read this and manually set document.cookie
      (res.headers as Record<string, string>)['X-Local-Set-Cookie'] = cookies[0];
    } else {
      // PRODUCTION: Standard AWS HTTP API v2 cookies array
      res.cookies = cookies;
    }
  }

  return res;
}

/**
 * Async variant of {@link response} that consults the dynamic DOMAIN# allowlist.
 * Use this from handlers that may be called from a customer's white-label host
 * (auth/session, auth/handoff, domains/*, and any endpoint a logged-in tenant
 * dashboard calls once it redirects back to a custom domain).
 */
export async function responseDynamic(
  statusCode: number,
  body: unknown,
  origin?: string,
  extraHeaders?: Record<string, string>,
  cookies?: string[],
) {
  const resolved = await resolveCorsOrigin(origin);
  return response(
    statusCode,
    body,
    resolved || origin,
    extraHeaders,
    cookies,
    Boolean(resolved),
  );
}

