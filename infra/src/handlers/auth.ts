import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { buildClearCookie, buildSessionCookie, encodeSession, parseSessionFromRequest } from '../lib/session';
import { response } from './cors';
import { getItem } from '../lib/dynamo';
import { withSentry } from '../lib/sentry';

const authHandler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  const host = event.headers['x-forwarded-host'] || event.headers['Host'] || '';
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const resolvedOrigin = origin || `${proto}://${host}`;
  const isLocal = resolvedOrigin.includes('localhost');
  const secureCookie = proto === 'https' && !isLocal;

  if (method === 'OPTIONS') {
    return response(200, { ok: true }, origin);
  }

  if (method === 'GET') {
    const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
    const session = parseSessionFromRequest(event);
    console.log('auth GET', { origin, cookie: cookieHeader, session });
    
    // Fetch fresh agency settings from DB if we have an agencyId
    if (session?.agencyId) {
      try {
        const agency = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: 'PROFILE' });
        if (agency?.settings) {
          session.agencySettings = agency.settings;
          session.agencyLogo = agency.settings?.logoDataUrl || agency.logoUrl || session.agencyLogo;
        }
        console.log('auth GET merged fresh settings', { agencyId: session.agencyId, hasSettings: !!agency?.settings });
      } catch (e) {
        console.error('auth GET failed to fetch agency settings', e);
        // Continue with cached session data
      }
    }
    
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
      // agencyLogo/agencySettings excluded to keep cookie <4KB; fetched fresh on GET
    });
    const cookie = buildSessionCookie(token, secureCookie, isLocal);
    return response(200, { ok: true, session: payload }, origin, {}, [cookie]);
  }

  if (method === 'DELETE') {
    return response(200, { ok: true }, origin, {}, [buildClearCookie(secureCookie, isLocal)]);
  }

  return response(405, { ok: false, error: `Method not allowed` }, origin);
};

export const handler = withSentry(authHandler);

