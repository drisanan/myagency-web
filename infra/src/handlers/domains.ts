/**
 * White-label custom-domain lifecycle handlers (Phase 5b).
 *
 * Three surfaces, one module, all gated by the agency session:
 *
 *   POST   /domains                                attach
 *   GET    /domains/{hostname}                     check / poll
 *   DELETE /domains/{hostname}                     remove
 *
 * Lifecycle:
 *   attach  -> create DOMAIN#, request ACM cert,       status = PENDING_DNS
 *   check   -> describe ACM + DNS resolvers,           status transitions
 *   remove  -> detach alias, delete cert, soft-delete, status = REMOVED
 *
 * The actual CloudFront alias attach happens in check() once the cert is
 * ISSUED, to minimize the number of distribution updates (each
 * UpdateDistribution takes minutes to deploy at the edge).
 *
 * Audit writes hit the same AUDIT# pattern used elsewhere in this codebase.
 */

import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { responseDynamic as response } from './cors';
import { parseSessionFromRequest } from '../lib/session';
import {
  createDomainRecord,
  findDomainByHostname,
  getDomainByAgency,
  listDomainsByAgency,
  updateDomainStatus,
} from '../lib/domains';
import {
  describeCertificateValidation,
  deleteCertificateArn,
  requestCertificateForHost,
} from '../lib/acmCerts';
import { attachAliasToDistribution, detachAliasFromDistribution } from '../lib/cloudfrontEdge';
import { checkCnameMatches } from '../lib/domainValidator';
import { HostnameNormalizeError, isInternalPilotHost, normalizeHostname } from '../../../services/domains';
import { putItem } from '../lib/dynamo';
import { consumeRateLimit } from '../lib/rateLimit';
import { captureError, captureMessage, withSentry } from '../lib/sentry';

const ATTACH_RATE_LIMIT = Number(process.env.DOMAIN_ATTACH_RATE_LIMIT || 10);
const ATTACH_RATE_WINDOW_MS = Number(process.env.DOMAIN_ATTACH_RATE_WINDOW_MS || 3_600_000);

const DISTRIBUTION_ID = process.env.EDGE_DISTRIBUTION_ID || '';
const TRAFFIC_TARGET = process.env.EDGE_TRAFFIC_TARGET || '';

// ACM is gated by an explicit flag so that pilot deploys without the
// acm:* IAM permission attached to this Lambda can still walk the
// attach -> DNS -> check flow. When disabled we persist a DOMAIN#
// record with manualCertRequired=true and skip every ACM SDK call; an
// operator issues the certificate out-of-band (Amplify wildcard or the
// edge stack).
function isAcmEnabled(): boolean {
  return process.env.ACM_ENABLED === 'true';
}

type Action =
  | 'domain_attached'
  | 'domain_attach_denied'
  | 'domain_checked'
  | 'domain_activated'
  | 'domain_removed'
  | 'domain_remove_denied';

async function audit(params: {
  action: Action;
  agencyId: string;
  hostname?: string;
  status?: string;
  errorCode?: string;
  ipAddress?: string;
  userAgent?: string;
}) {
  const ts = Date.now();
  const id = `${ts}-${Math.random().toString(36).slice(2, 10)}`;
  try {
    await putItem({
      PK: `AGENCY#${params.agencyId}`,
      SK: `AUDIT#${ts}#${id}`,
      id,
      agencyId: params.agencyId,
      action: params.action,
      actorType: 'system',
      details: {
        hostname: params.hostname,
        status: params.status,
        errorCode: params.errorCode,
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
      timestamp: ts,
    });
  } catch (err) {
    console.error('[domains] audit write failed', err);
  }
}

function badRequest(origin: string, message: string, code?: string) {
  return response(400, { ok: false, error: message, code }, origin);
}

async function handleAttach(event: APIGatewayProxyEventV2, origin: string) {
  const session = parseSessionFromRequest(event);
  if (!session?.agencyId || (session.role !== 'agency' && session.role !== 'admin')) {
    return response(401, { ok: false, error: 'agency session required' }, origin);
  }

  // Rate-limit attaches per agency so a buggy client (or a bad actor with a
  // stolen session) cannot issue unbounded ACM cert requests.
  const rl = consumeRateLimit(
    `domain-attach:${session.agencyId}`,
    ATTACH_RATE_LIMIT,
    ATTACH_RATE_WINDOW_MS,
  );
  if (!rl.allowed) {
    await audit({
      action: 'domain_attach_denied',
      agencyId: session.agencyId,
      errorCode: 'ERR_RATE_LIMITED',
    });
    return response(
      429,
      {
        ok: false,
        error: 'rate limit exceeded',
        code: 'ERR_RATE_LIMITED',
        resetAt: rl.resetAt,
      },
      origin,
    );
  }

  if (!event.body) return badRequest(origin, 'missing body');
  let body: { hostname?: unknown };
  try {
    body = JSON.parse(event.body);
  } catch {
    return badRequest(origin, 'invalid json');
  }
  if (typeof body.hostname !== 'string') return badRequest(origin, 'hostname required');

  let hostname: string;
  try {
    hostname = normalizeHostname(body.hostname);
  } catch (err) {
    const code = err instanceof HostnameNormalizeError ? err.code : 'ERR_HOSTNAME';
    await audit({
      action: 'domain_attach_denied',
      agencyId: session.agencyId,
      hostname: String(body.hostname),
      errorCode: code,
    });
    return badRequest(origin, err instanceof Error ? err.message : 'invalid hostname', code);
  }

  if (isInternalPilotHost(hostname)) {
    await audit({
      action: 'domain_attach_denied',
      agencyId: session.agencyId,
      hostname,
      errorCode: 'ERR_PILOT_RESERVED',
    });
    return response(
      403,
      { ok: false, error: 'reserved internal host', code: 'ERR_PILOT_RESERVED' },
      origin,
    );
  }

  const existing = await findDomainByHostname(hostname);
  if (existing && existing.agencyId !== session.agencyId) {
    await audit({
      action: 'domain_attach_denied',
      agencyId: session.agencyId,
      hostname,
      errorCode: 'ERR_HOST_CLAIMED',
    });
    return response(
      409,
      { ok: false, error: 'hostname already claimed', code: 'ERR_HOST_CLAIMED' },
      origin,
    );
  }

  const acmEnabled = isAcmEnabled();
  let certArn: string | undefined;
  if (acmEnabled) {
    try {
      const cert = await requestCertificateForHost({
        hostname,
        agencyId: session.agencyId,
      });
      certArn = cert.certArn;
    } catch (err) {
      captureError(err, {
        scope: 'domains.attach',
        agencyId: session.agencyId,
        hostname,
        stage: 'acm_request',
      });
      await audit({
        action: 'domain_attach_denied',
        agencyId: session.agencyId,
        hostname,
        errorCode: 'ERR_ACM_REQUEST',
      });
      return response(
        502,
        { ok: false, error: 'certificate request failed', code: 'ERR_ACM_REQUEST' },
        origin,
      );
    }
  }

  const record = await createDomainRecord({
    agencyId: session.agencyId,
    hostname,
    status: 'PENDING_DNS',
    trafficTarget: TRAFFIC_TARGET || undefined,
    manualCertRequired: !acmEnabled,
  });
  if (certArn) {
    await updateDomainStatus({
      agencyId: session.agencyId,
      hostname,
      status: 'PENDING_DNS',
      certArn,
    });
  }

  await audit({
    action: 'domain_attached',
    agencyId: session.agencyId,
    hostname,
    status: 'PENDING_DNS',
  });

  return response(
    201,
    {
      ok: true,
      domain: {
        ...record,
        ...(certArn ? { certArn } : {}),
        status: 'PENDING_DNS' as const,
      },
      next: 'poll GET /domains/{hostname} until status=ACTIVE',
    },
    origin,
  );
}

async function handleCheck(event: APIGatewayProxyEventV2, origin: string, hostnameRaw: string) {
  const session = parseSessionFromRequest(event);
  if (!session?.agencyId) {
    return response(401, { ok: false, error: 'agency session required' }, origin);
  }
  let hostname: string;
  try {
    hostname = normalizeHostname(hostnameRaw);
  } catch (err) {
    return badRequest(
      origin,
      err instanceof Error ? err.message : 'invalid hostname',
      'ERR_HOSTNAME',
    );
  }

  const domain = await getDomainByAgency(session.agencyId, hostname);
  if (!domain) return response(404, { ok: false, error: 'not found' }, origin);

  // ACM-disabled (manualCertRequired) or ACM-pending (no certArn yet) paths
  // skip the AWS describe call entirely. We still run a DNS probe so the
  // wizard + status board can show whether the customer's CNAME is in place.
  if (!isAcmEnabled() || domain.manualCertRequired || !domain.certArn) {
    const dnsCheck = domain.trafficTarget
      ? await checkCnameMatches({
          hostname,
          expected: domain.trafficTarget,
        }).catch(() => null)
      : null;
    await audit({
      action: 'domain_checked',
      agencyId: session.agencyId,
      hostname,
      status: domain.status,
    });
    return response(200, { ok: true, domain, dnsCheck }, origin);
  }

  const certView = await describeCertificateValidation(domain.certArn);

  let nextStatus = domain.status;
  let trafficTarget = domain.trafficTarget;

  if (certView.status === 'ISSUED' && domain.status !== 'ACTIVE') {
    if (DISTRIBUTION_ID) {
      try {
        await attachAliasToDistribution({
          distributionId: DISTRIBUTION_ID,
          hostname,
          certArn: domain.certArn,
        });
        nextStatus = 'ACTIVE';
        trafficTarget = trafficTarget || TRAFFIC_TARGET || DISTRIBUTION_ID;
      } catch (err) {
        await updateDomainStatus({
          agencyId: session.agencyId,
          hostname,
          status: 'FAILED',
          lastError: err instanceof Error ? err.message : String(err),
        });
        return response(
          500,
          {
            ok: false,
            error: 'alias attach failed',
            code: 'ERR_EDGE_ATTACH',
          },
          origin,
        );
      }
    } else {
      nextStatus = 'PROVISIONING';
    }
  } else if (certView.status === 'PENDING_VALIDATION') {
    nextStatus = certView.validationRecord ? 'VALIDATING' : 'PENDING_DNS';
  } else if (certView.status === 'FAILED') {
    nextStatus = 'FAILED';
  }

  const dnsCheck = domain.trafficTarget
    ? await checkCnameMatches({
        hostname,
        expected: domain.trafficTarget,
      }).catch(() => null)
    : null;

  if (nextStatus !== domain.status || trafficTarget !== domain.trafficTarget) {
    await updateDomainStatus({
      agencyId: session.agencyId,
      hostname,
      status: nextStatus,
      validationRecord: certView.validationRecord || domain.validationRecord,
      trafficTarget,
    });
  }

  if (nextStatus === 'ACTIVE' && domain.status !== 'ACTIVE') {
    captureMessage(`domain activated: ${hostname}`, 'info', {
      agencyId: session.agencyId,
      hostname,
    });
    await audit({
      action: 'domain_activated',
      agencyId: session.agencyId,
      hostname,
      status: 'ACTIVE',
    });
  } else {
    await audit({
      action: 'domain_checked',
      agencyId: session.agencyId,
      hostname,
      status: nextStatus,
    });
  }

  return response(
    200,
    {
      ok: true,
      domain: { ...domain, status: nextStatus, trafficTarget },
      cert: certView,
      dnsCheck,
    },
    origin,
  );
}

async function handleRemove(
  event: APIGatewayProxyEventV2,
  origin: string,
  hostnameRaw: string,
) {
  const session = parseSessionFromRequest(event);
  if (!session?.agencyId || (session.role !== 'agency' && session.role !== 'admin')) {
    return response(401, { ok: false, error: 'agency session required' }, origin);
  }
  let hostname: string;
  try {
    hostname = normalizeHostname(hostnameRaw);
  } catch (err) {
    return badRequest(
      origin,
      err instanceof Error ? err.message : 'invalid hostname',
      'ERR_HOSTNAME',
    );
  }
  const domain = await getDomainByAgency(session.agencyId, hostname);
  if (!domain) return response(404, { ok: false, error: 'not found' }, origin);

  // Skip the CloudFront detach when the record was created in ACM-off mode:
  // no alias was ever attached, and calling UpdateDistribution without the
  // corresponding acm:* / cloudfront:* IAM grants would just 502.
  const canTouchEdge =
    DISTRIBUTION_ID && !domain.manualCertRequired && isAcmEnabled();
  if (canTouchEdge) {
    try {
      await detachAliasFromDistribution({ distributionId: DISTRIBUTION_ID, hostname });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (!/NoSuchAlias|InvalidArgument/i.test(message)) {
        captureError(err, {
          scope: 'domains.remove',
          agencyId: session.agencyId,
          hostname,
          stage: 'edge_detach',
        });
        await updateDomainStatus({
          agencyId: session.agencyId,
          hostname,
          status: 'FAILED',
          lastError: message,
        });
        await audit({
          action: 'domain_remove_denied',
          agencyId: session.agencyId,
          hostname,
          errorCode: 'ERR_EDGE_DETACH',
        });
        return response(
          500,
          { ok: false, error: 'alias detach failed', code: 'ERR_EDGE_DETACH' },
          origin,
        );
      }
    }
  }

  if (domain.certArn && isAcmEnabled()) {
    try {
      await deleteCertificateArn(domain.certArn);
    } catch (err) {
      console.error('[domains] deleteCertificate failed (non-fatal)', err);
    }
  }

  await updateDomainStatus({
    agencyId: session.agencyId,
    hostname,
    status: 'REMOVED',
  });

  await audit({
    action: 'domain_removed',
    agencyId: session.agencyId,
    hostname,
    status: 'REMOVED',
  });

  return response(200, { ok: true, hostname, status: 'REMOVED' as const }, origin);
}

async function handleList(event: APIGatewayProxyEventV2, origin: string) {
  const session = parseSessionFromRequest(event);
  if (!session?.agencyId) {
    return response(401, { ok: false, error: 'unauthorized' }, origin);
  }
  const items = await listDomainsByAgency(session.agencyId);
  return response(200, { ok: true, domains: items }, origin);
}

const domainsHandler = async (event: APIGatewayProxyEventV2) => {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const path = event.requestContext.http?.path || event.rawPath || '';

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  const match = path.match(/^\/domains(?:\/(.+))?$/);
  const hostnameFromPath = match?.[1];

  if (method === 'POST' && !hostnameFromPath) return handleAttach(event, origin);
  if (method === 'GET' && !hostnameFromPath) return handleList(event, origin);
  if (method === 'GET' && hostnameFromPath) {
    return handleCheck(event, origin, decodeURIComponent(hostnameFromPath));
  }
  if (method === 'DELETE' && hostnameFromPath) {
    return handleRemove(event, origin, decodeURIComponent(hostnameFromPath));
  }
  return response(405, { ok: false, error: 'method not allowed' }, origin);
};

export const handler = withSentry(domainsHandler);
