import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { buildClearCookie, buildSessionCookie, encodeSession, parseSessionFromRequest } from '../lib/session';
import { responseDynamic as response } from './cors';
import { getItem, queryByPK, putItem } from '../lib/dynamo';
import { withSentry } from '../lib/sentry';
import { AgencyRecord } from '../lib/models';
import { consumeHandoffToken, verifyHandoffToken } from '../lib/handoffToken';

type AuthAuditAction = 'session_mint' | 'session_mint_denied' | 'session_clear';

async function writeAuthAudit(params: {
  action: AuthAuditAction;
  agencyId?: string;
  email?: string;
  source?: string;
  errorCode?: string;
  ipAddress?: string;
  userAgent?: string;
}): Promise<void> {
  const timestamp = Date.now();
  const id = `${timestamp}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    await putItem({
      PK: `AGENCY#${params.agencyId || 'UNKNOWN'}`,
      SK: `AUDIT#${timestamp}#${id}`,
      id,
      agencyId: params.agencyId || 'UNKNOWN',
      action: params.action,
      actorType: 'system',
      actorEmail: params.email || 'unknown',
      details: {
        source: params.source,
        errorCode: params.errorCode,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp,
    });
  } catch (err) {
    console.error('[auth] audit write failed', err);
  }
}

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
    // Phase 1 hardening: POST /auth/session only mints a session if the body
    // includes a valid, unused, unexpired handoff token issued by one of the
    // three legitimate upstream credential-verification paths (GHL login,
    // client portal login, Google OAuth). Body-only mints are 401.
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    let payload: Record<string, unknown>;
    try {
      payload = JSON.parse(event.body);
    } catch {
      return response(400, { ok: false, error: 'Invalid JSON' }, origin);
    }

    const ipAddress =
      (headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      (headers['x-real-ip'] as string | undefined);
    const userAgent = headers['user-agent'] as string | undefined;

    const handoffToken =
      typeof payload.handoffToken === 'string' ? (payload.handoffToken as string) : '';
    if (!handoffToken) {
      await writeAuthAudit({
        action: 'session_mint_denied',
        agencyId: typeof payload.agencyId === 'string' ? payload.agencyId : undefined,
        email: typeof payload.email === 'string' ? payload.email : undefined,
        errorCode: 'ERR_AUTH_NO_HANDOFF',
        ipAddress,
        userAgent,
      });
      return response(
        401,
        { ok: false, error: 'Handoff token required', code: 'ERR_AUTH_NO_HANDOFF' },
        origin,
      );
    }

    const verified = verifyHandoffToken(handoffToken);
    if (!verified.ok) {
      await writeAuthAudit({
        action: 'session_mint_denied',
        errorCode: verified.code,
        ipAddress,
        userAgent,
      });
      return response(401, { ok: false, error: 'Invalid handoff token', code: verified.code }, origin);
    }

    const claimed = await consumeHandoffToken(verified.payload.jti);
    if (!claimed) {
      await writeAuthAudit({
        action: 'session_mint_denied',
        agencyId: verified.payload.agencyId,
        email: verified.payload.email,
        source: verified.payload.source,
        errorCode: 'ERR_AUTH_HANDOFF_USED',
        ipAddress,
        userAgent,
      });
      return response(
        401,
        { ok: false, error: 'Handoff token already used', code: 'ERR_AUTH_HANDOFF_USED' },
        origin,
      );
    }

    const token = encodeSession({
      agencyId: verified.payload.agencyId,
      agencyEmail: verified.payload.email,
      role: verified.payload.role,
      userId: verified.payload.userId,
      firstName: verified.payload.firstName,
      lastName: verified.payload.lastName,
    });
    const cookie = buildSessionCookie(token, secureCookie, isLocal);

    await writeAuthAudit({
      action: 'session_mint',
      agencyId: verified.payload.agencyId,
      email: verified.payload.email,
      source: verified.payload.source,
      ipAddress,
      userAgent,
    });

    return response(
      200,
      {
        ok: true,
        session: {
          agencyId: verified.payload.agencyId,
          email: verified.payload.email,
          role: verified.payload.role,
          userId: verified.payload.userId,
          firstName: verified.payload.firstName,
          lastName: verified.payload.lastName,
        },
      },
      origin,
      {},
      [cookie],
    );
  }

  if (method === 'DELETE') {
    const ipAddress =
      (headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
      (headers['x-real-ip'] as string | undefined);
    const userAgent = headers['user-agent'] as string | undefined;
    const existing = parseSessionFromRequest(event);
    await writeAuthAudit({
      action: 'session_clear',
      agencyId: existing?.agencyId,
      email: existing?.agencyEmail || existing?.email,
      ipAddress,
      userAgent,
    });
    const clearCookie = buildClearCookie(secureCookie, isLocal);
    return response(200, { ok: true }, origin, {}, [clearCookie]);
  }

  return response(405, { ok: false, error: `Method not allowed` }, origin);
};

export const handler = withSentry(authHandler);

