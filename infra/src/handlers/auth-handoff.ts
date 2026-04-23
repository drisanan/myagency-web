/**
 * GET /auth/handoff?return_to=<absolute https url>
 *
 * Phase 4: custom-host sign-in redirect.
 *
 * The flow:
 *   1. User clicks "Sign in" on a custom / pilot host (e.g.
 *      https://pilot1.myrecruiteragency.com).
 *   2. The landing template sends them to the canonical auth surface
 *      (https://app.myrecruiteragency.com/auth/login?return_to=<custom-url>).
 *   3. After the normal login completes the browser has a canonical
 *      an_session cookie. The frontend then calls THIS endpoint with
 *      return_to=<custom-url>.
 *   4. This endpoint:
 *        - requires a valid canonical session (parseSessionFromRequest)
 *        - parses return_to, requires https + hostname != canonical
 *        - requires a DOMAIN#<hostname> row with status=ACTIVE belonging
 *          to the same agencyId as the session (prevents session
 *          smuggling: I cannot hand off to another tenant's host)
 *        - mints a single-use handoff token tied to that session
 *        - 302s to https://<hostname>/auth/handoff?token=<jwt>&return_to=<path>
 *   5. The custom host's /auth/handoff page consumes the token via
 *      POST /auth/session and redirects to <path>.
 *
 * Security notes:
 *   - Treats return_to as hostile input; hostnames are whitelisted by
 *     DOMAIN# rows only (open redirect prevention).
 *   - Handoff token TTL is 60s and single-use (see lib/handoffToken.ts).
 *   - Agency binding: we refuse to hand off a session whose agencyId does
 *     not match the DOMAIN#'s agencyId.
 *   - This handler NEVER mints a session directly -- it only issues a
 *     token for POST /auth/session to consume.
 */

import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { responseDynamic as response } from './cors';
import { parseSessionFromRequest } from '../lib/session';
import { mintHandoffToken } from '../lib/handoffToken';
import { queryGSI1, putItem } from '../lib/dynamo';
import { withSentry } from '../lib/sentry';

const CANONICAL_HOSTS = (process.env.CANONICAL_HOSTS ||
  'myrecruiteragency.com,app.myrecruiteragency.com,www.myrecruiteragency.com')
  .split(',')
  .map((h) => h.trim().toLowerCase())
  .filter(Boolean);

type HandoffAuditAction = 'handoff_issued' | 'handoff_denied';

async function writeHandoffAudit(params: {
  action: HandoffAuditAction;
  agencyId?: string;
  email?: string;
  targetHost?: string;
  errorCode?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const ts = Date.now();
  const id = `${ts}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    await putItem({
      PK: `AGENCY#${params.agencyId || 'UNKNOWN'}`,
      SK: `AUDIT#${ts}#${id}`,
      id,
      agencyId: params.agencyId || 'UNKNOWN',
      action: params.action,
      actorType: 'system',
      actorEmail: params.email || 'unknown',
      details: { targetHost: params.targetHost, errorCode: params.errorCode },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: ts,
    });
  } catch (err) {
    console.error('[auth-handoff] audit write failed', err);
  }
}

function isCanonicalHost(host: string): boolean {
  const h = host.toLowerCase();
  return CANONICAL_HOSTS.some((c) => h === c);
}

function parseReturnTo(raw: string | undefined): URL | null {
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== 'https:') return null;
    if (!url.hostname) return null;
    return url;
  } catch {
    return null;
  }
}

const handoffHandler = async (event: APIGatewayProxyEventV2) => {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method !== 'GET' && method !== 'POST') {
    return response(405, { ok: false, error: 'Method not allowed' }, origin);
  }

  const ipAddress =
    (headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ||
    (headers['x-real-ip'] as string | undefined);
  const userAgent = headers['user-agent'] as string | undefined;

  const session = parseSessionFromRequest(event);
  if (!session?.agencyId) {
    return response(
      401,
      { ok: false, error: 'Canonical session required', code: 'ERR_HANDOFF_NO_SESSION' },
      origin,
    );
  }

  const qs = event.queryStringParameters || {};
  const returnToRaw = qs.return_to || qs.returnTo;
  const returnUrl = parseReturnTo(returnToRaw || undefined);
  if (!returnUrl) {
    await writeHandoffAudit({
      action: 'handoff_denied',
      agencyId: session.agencyId,
      email: session.agencyEmail || session.email,
      errorCode: 'ERR_HANDOFF_BAD_RETURN_TO',
      ipAddress,
      userAgent,
    });
    return response(
      400,
      { ok: false, error: 'Invalid return_to', code: 'ERR_HANDOFF_BAD_RETURN_TO' },
      origin,
    );
  }

  const targetHost = returnUrl.hostname.toLowerCase();
  if (isCanonicalHost(targetHost)) {
    return response(
      400,
      {
        ok: false,
        error: 'return_to must be a non-canonical host',
        code: 'ERR_HANDOFF_CANONICAL_TARGET',
      },
      origin,
    );
  }

  const domainRows = (await queryGSI1(`DOMAIN#${targetHost}`)) as Array<{
    agencyId: string;
    status: string;
  }>;
  const activeRow = domainRows.find((d) => d.status === 'ACTIVE');
  if (!activeRow) {
    await writeHandoffAudit({
      action: 'handoff_denied',
      agencyId: session.agencyId,
      email: session.agencyEmail || session.email,
      targetHost,
      errorCode: 'ERR_HANDOFF_HOST_NOT_ATTACHED',
      ipAddress,
      userAgent,
    });
    return response(
      403,
      { ok: false, error: 'Target host not attached', code: 'ERR_HANDOFF_HOST_NOT_ATTACHED' },
      origin,
    );
  }

  if (activeRow.agencyId !== session.agencyId) {
    await writeHandoffAudit({
      action: 'handoff_denied',
      agencyId: session.agencyId,
      email: session.agencyEmail || session.email,
      targetHost,
      errorCode: 'ERR_HANDOFF_AGENCY_MISMATCH',
      ipAddress,
      userAgent,
    });
    return response(
      403,
      {
        ok: false,
        error: 'Session agency does not own target host',
        code: 'ERR_HANDOFF_AGENCY_MISMATCH',
      },
      origin,
    );
  }

  const token = mintHandoffToken({
    agencyId: session.agencyId,
    email: session.agencyEmail || session.email || '',
    role: session.role,
    userId: session.userId,
    firstName: session.firstName,
    lastName: session.lastName,
    source: 'google-oauth',
  });

  const destination = new URL(`${returnUrl.origin}/auth/handoff`);
  destination.searchParams.set('token', token);
  destination.searchParams.set('return_to', returnUrl.pathname + returnUrl.search);

  await writeHandoffAudit({
    action: 'handoff_issued',
    agencyId: session.agencyId,
    email: session.agencyEmail || session.email,
    targetHost,
    ipAddress,
    userAgent,
  });

  return response(
    200,
    { ok: true, redirectUrl: destination.toString(), targetHost },
    origin,
  );
};

export const handler = withSentry(handoffHandler);
