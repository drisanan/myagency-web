import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { createHmac, timingSafeEqual } from 'crypto';
import { SessionContext } from './models';

const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const COOKIE_NAME = 'an_session';

function getCookieDomain(): string {
  return process.env.COOKIE_DOMAIN || '.myrecruiteragency.com';
}

function sign(payload: string) {
  const sig = createHmac('sha256', SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verify(token: string) {
  const idx = token.lastIndexOf('.');
  if (idx < 0) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac('sha256', SECRET).update(payload).digest('base64url');
  const a = Buffer.from(sig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as SessionContext;
  } catch {
    return null;
  }
}

export function encodeSession(session: SessionContext) {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return sign(payload);
}

export function parseSession(token?: string | null): SessionContext | null {
  if (!token) return null;
  return verify(token);
}

function parseCookie(header?: string): Record<string, string> {
  if (!header) return {};
  return header.split(';').reduce<Record<string, string>>((acc, part) => {
    const [k, v] = part.trim().split('=');
    if (k && v) acc[k] = v;
    return acc;
  }, {});
}

function readCookieString(event: APIGatewayProxyEventV2): string | undefined {
  if (event.cookies && event.cookies.length > 0) {
    return event.cookies.join('; ');
  }
  return event.headers.cookie || (event.headers as any).Cookie;
}

export function parseSessionFromRequest(event: APIGatewayProxyEventV2): SessionContext | null {
  const cookieHeader = readCookieString(event);
  const cookies = parseCookie(cookieHeader);
  const token = cookies[COOKIE_NAME];
  return parseSession(token);
}

export function buildSessionCookie(token: string, secure = true, local = false) {
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    'HttpOnly',
    'Path=/',
    // For localhost, use SameSite=Lax (no Secure required); for production use SameSite=None + Secure
    local ? 'SameSite=Lax' : 'SameSite=None',
    // Omit Domain for localhost so cookie works across ports (3000 frontend, 3001 API)
    ...(local ? [] : [`Domain=${getCookieDomain()}`]),
    ...(secure && !local ? ['Secure'] : []),
    'Max-Age=604800', // 7d
  ];
  return attrs.join('; ');
}

export function buildClearCookie(secure = true, local = false) {
  const sameSite = local ? 'Lax' : 'None';
  const domain = local ? '' : `; Domain=${getCookieDomain()}`;
  const secureFlag = secure && !local ? '; Secure' : '';
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=${sameSite}${domain}${secureFlag}`;
}

