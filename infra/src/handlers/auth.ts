import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { buildClearCookie, buildSessionCookie, encodeSession, parseSessionFromRequest } from '../lib/session';
import { response } from './cors';

export const handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  const host = event.headers['x-forwarded-host'] || event.headers['Host'] || '';
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const resolvedOrigin = origin || `${proto}://${host}`;
  const secureCookie = proto === 'https' && !resolvedOrigin.includes('localhost');

  if (method === 'OPTIONS') {
    return response(200, { ok: true }, origin);
  }

  if (method === 'GET') {
    const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
    const session = parseSessionFromRequest(event);
    console.log('auth GET', { origin, cookie: cookieHeader, session });
    return response(200, { ok: true, session }, origin);
  }

  if (method === 'POST') {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const payload = JSON.parse(event.body);
    if (!payload.agencyId || !payload.email || !payload.role) {
      return response(400, { ok: false, error: 'agencyId, email, role required' }, origin);
    }
    const token = encodeSession({
      agencyId: payload.agencyId,
      agencyEmail: payload.email,
      role: payload.role,
      userId: payload.userId,
      firstName: payload.firstName,
      lastName: payload.lastName,
      agencyLogo: payload.agencyLogo,
      agencySettings: payload.agencySettings,
    });
    const cookie = buildSessionCookie(token, secureCookie);
    return response(200, { ok: true, session: payload }, origin, { 'set-cookie': cookie });
  }

  if (method === 'DELETE') {
    return response(200, { ok: true }, origin, { 'set-cookie': buildClearCookie(secureCookie) });
  }

  return response(405, { ok: false, error: `Method not allowed` }, origin);
};

