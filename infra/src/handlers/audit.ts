/**
 * GET /audit?scope=domains&hostname=...&limit=...
 *
 * Returns the recent AUDIT# items for the caller's agency. Filters are
 * intentionally narrow -- this endpoint powers the Phase 7 diagnostics drawer
 * in the settings UI and is not a general-purpose admin surface.
 *
 * Scope values:
 *   - "domains" (default): any action starting with `domain_`
 *   - "auth": any action starting with `auth_` (used by the auth handoff drawer)
 *
 * AUDIT# sort keys are timestamp-prefixed, so we rely on DynamoDB ordering
 * and apply filters in-process. For Phase 7 volumes (a handful of events per
 * tenant per day) this is fine; a GSI on action can come later if needed.
 */

import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { responseDynamic as response } from './cors';
import { parseSessionFromRequest } from '../lib/session';
import { queryByPK } from '../lib/dynamo';
import { withSentry } from '../lib/sentry';

type Scope = 'domains' | 'auth';

type AuditItem = {
  PK: string;
  SK: string;
  id: string;
  agencyId: string;
  action: string;
  actorType?: string;
  actorId?: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
};

function matchesScope(action: string, scope: Scope): boolean {
  if (scope === 'auth') return action.startsWith('auth_');
  return action.startsWith('domain_');
}

const auditHandler = async (event: APIGatewayProxyEventV2) => {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method !== 'GET') {
    return response(405, { ok: false, error: 'method not allowed' }, origin);
  }

  const session = parseSessionFromRequest(event);
  if (!session?.agencyId) {
    return response(401, { ok: false, error: 'unauthorized' }, origin);
  }

  const qs = event.queryStringParameters || {};
  const scope: Scope = qs.scope === 'auth' ? 'auth' : 'domains';
  const hostnameFilter = (qs.hostname || '').trim().toLowerCase();
  const limit = Math.min(Math.max(Number(qs.limit || 50), 1), 200);

  const items = (await queryByPK(`AGENCY#${session.agencyId}`, 'AUDIT#')) as AuditItem[];
  const filtered = items
    .filter((i) => matchesScope(i.action, scope))
    .filter((i) =>
      hostnameFilter
        ? typeof i.details?.hostname === 'string' && i.details.hostname === hostnameFilter
        : true,
    )
    .sort((a, b) => b.timestamp - a.timestamp)
    .slice(0, limit)
    .map((i) => ({
      id: i.id,
      action: i.action,
      actorType: i.actorType,
      details: i.details,
      timestamp: i.timestamp,
      ipAddress: i.ipAddress,
    }));

  return response(200, { ok: true, events: filtered }, origin);
};

export const handler = withSentry(auditHandler);
