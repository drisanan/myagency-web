import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { createHmac, timingSafeEqual } from 'crypto';
import { SessionContext } from './models';

const SECRET = process.env.SESSION_SECRET || 'dev-secret-change-me';
const COOKIE_NAME = 'an_session';

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

export function parseSessionFromRequest(event: APIGatewayProxyEventV2): SessionContext | null {
  const cookieHeader = event.headers.cookie || event.headers.Cookie;
  const cookies = parseCookie(cookieHeader);
  const token = cookies[COOKIE_NAME];
  return parseSession(token);
}

export function buildSessionCookie(token: string, secure = true) {
  const attrs = [
    `${COOKIE_NAME}=${token}`,
    'HttpOnly',
    'Path=/',
    'SameSite=None',
    ...(secure ? ['Secure'] : []),
    'Max-Age=604800', // 7d
  ];
  return attrs.join('; ');
}

export function buildClearCookie(secure = true) {
  const attrs = [`${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=None${secure ? '; Secure' : ''}`];
  return attrs.join('; ');
}

