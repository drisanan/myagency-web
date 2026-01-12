import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { buildClearCookie, buildSessionCookie, encodeSession, parseSessionFromRequest } from '../lib/session';
import { response } from './cors';
import { getItem, queryByPK } from '../lib/dynamo';
import { withSentry } from '../lib/sentry';
import { AgencyRecord, STARTER_USER_LIMIT } from '../lib/models';

const authHandler = async (event: APIGatewayProxyEventV2) => {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  const host = headers['x-forwarded-host'] || headers.host || headers.Host || '';
  const proto = headers['x-forwarded-proto'] || 'https';
  const resolvedOrigin = origin || `${proto}://${host}`;
  const isLocal = resolvedOrigin.includes('localhost');
  console.log('[auth] locality check:', { origin, host, proto, resolvedOrigin, isLocal });
  const secureCookie = proto === 'https' && !isLocal;

  if (method === 'OPTIONS') {
    return response(200, { ok: true }, origin);
  }

  if (method === 'GET') {
    const cookieHeader = event.headers?.cookie || event.headers?.Cookie;
    const session = parseSessionFromRequest(event);
    console.log('auth GET', { origin, cookie: cookieHeader, session });
    
    // Fetch fresh agency settings and subscription info from DB if we have an agencyId
    if (session?.agencyId) {
      try {
        const agency = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: 'PROFILE' }) as AgencyRecord | undefined;
        if (agency) {
          // Merge agency settings
          if (agency.settings) {
            session.agencySettings = agency.settings;
            session.agencyLogo = agency.settings?.logoDataUrl || (agency as any).logoUrl || session.agencyLogo;
          }
          
          // Include subscription level (default to 'starter')
          session.subscriptionLevel = agency.subscriptionLevel || 'starter';
          
          // Count active clients + agents for quota display
          try {
            const clients = await queryByPK(`AGENCY#${session.agencyId}`, 'CLIENT#');
            const activeClients = clients.filter((c: any) => !c.deletedAt);
            
            const agents = await queryByPK(`AGENCY#${session.agencyId}`, 'AGENT#');
            const activeAgents = agents.filter((a: any) => !a.deletedAt);
            
            session.currentUserCount = activeClients.length + activeAgents.length;
          } catch (countErr) {
            console.error('auth GET failed to count users', countErr);
            session.currentUserCount = 0;
          }
        }
        console.log('auth GET merged fresh settings', { 
          agencyId: session.agencyId, 
          hasSettings: !!agency?.settings,
          subscriptionLevel: session.subscriptionLevel,
          currentUserCount: session.currentUserCount
        });
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
    // response() now handles both local (multiValueHeaders) and prod (cookies array)
    return response(200, { ok: true, session: payload }, origin, {}, [cookie]);
  }

  if (method === 'DELETE') {
    const clearCookie = buildClearCookie(secureCookie, isLocal);
    return response(200, { ok: true }, origin, {}, [clearCookie]);
  }

  return response(405, { ok: false, error: `Method not allowed` }, origin);
};

export const handler = withSentry(authHandler);

