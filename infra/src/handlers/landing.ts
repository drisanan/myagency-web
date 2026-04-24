/**
 * Public landing resolver endpoint.
 *
 *   GET /landing?host=<hostname>
 *   GET /landing?agencyId=<id>
 *
 * Unauthenticated. Returns the same shape as the SSR-side
 * `services/landingResolver.ts` so the Next.js server component can call
 * this endpoint via HTTP and stay decoupled from the DynamoDB IAM /
 * region configuration of whatever host runs the SSR layer (Amplify
 * SSR Compute in our case, which cannot reach DDB directly).
 *
 * Only the fields needed by public templates are returned — intentionally
 * narrow to avoid leaking internal agency state (e.g. subscriptionLevel,
 * emails, etc. are stripped).
 */

import type { APIGatewayProxyEventV2 } from 'aws-lambda';
import { responseDynamic as response } from './cors';
import { findDomainByHostname } from '../lib/domains';
import { getItem, queryByPK } from '../lib/dynamo';
import { normalizeHostname } from '../../../services/domains';
import type { DomainRecord } from '../../../services/domains';
import type {
  AgencyLandingConfig,
  AgencyRecord,
  AgencySettings,
} from '../lib/models';
import { withSentry } from '../lib/sentry';

type PublicAgencyView = {
  id: string;
  name: string;
  slug?: string;
  settings: AgencySettings;
};

type ResolvedView = {
  ok: true;
  agency: PublicAgencyView;
  domain: DomainRecord;
  landing: AgencyLandingConfig;
  isPreview: boolean;
  activeCustomHostname: string | null;
};

function toPublicAgency(a: AgencyRecord): PublicAgencyView {
  const settings = a.settings || {};
  return {
    id: a.id,
    name: a.name,
    slug: a.slug,
    // Return full settings — templates need colors, logo, and the landing
    // config. Nothing here is private.
    settings,
  };
}

async function resolveByHostname(hostnameRaw: string): Promise<ResolvedView | null> {
  let hostname: string;
  try {
    hostname = normalizeHostname(hostnameRaw);
  } catch {
    return null;
  }
  const domain = await findDomainByHostname(hostname);
  if (!domain) return null;

  const agency = (await getItem({
    PK: `AGENCY#${domain.agencyId}`,
    SK: 'PROFILE',
  })) as AgencyRecord | undefined;
  if (!agency) return null;

  const landing: AgencyLandingConfig = agency.settings?.landing || {};

  return {
    ok: true,
    agency: toPublicAgency(agency),
    domain,
    landing,
    isPreview: false,
    activeCustomHostname: domain.hostname,
  };
}

async function resolveByAgencyId(agencyId: string): Promise<ResolvedView | null> {
  const agency = (await getItem({
    PK: `AGENCY#${agencyId}`,
    SK: 'PROFILE',
  })) as AgencyRecord | undefined;
  if (!agency) return null;

  const landing: AgencyLandingConfig = agency.settings?.landing || {};

  const ownedDomains = (await queryByPK(`AGENCY#${agencyId}`, 'DOMAIN#')) as DomainRecord[];
  const activeDomain = ownedDomains.find((d) => d.status === 'ACTIVE');

  const synthetic: DomainRecord = {
    PK: `AGENCY#${agencyId}`,
    SK: 'DOMAIN#__preview__',
    GSI1PK: 'DOMAIN#__preview__',
    GSI1SK: `AGENCY#${agencyId}`,
    id: `${agencyId}:__preview__`,
    agencyId,
    hostname: '__preview__',
    status: 'ACTIVE',
    createdAt: agency.createdAt || Date.now(),
    updatedAt: Date.now(),
  };

  return {
    ok: true,
    agency: toPublicAgency(agency),
    domain: synthetic,
    landing,
    isPreview: true,
    activeCustomHostname: activeDomain?.hostname || null,
  };
}

const landingHandler = async (event: APIGatewayProxyEventV2) => {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method !== 'GET') {
    return response(405, { ok: false, error: 'method not allowed' }, origin);
  }

  const qs = event.queryStringParameters || {};
  const host = (qs.host || '').trim();
  const agencyId = (qs.agencyId || '').trim();

  if (!host && !agencyId) {
    return response(
      400,
      { ok: false, error: 'host or agencyId required', code: 'ERR_MISSING_PARAM' },
      origin,
    );
  }

  try {
    const resolved = agencyId
      ? await resolveByAgencyId(agencyId)
      : await resolveByHostname(host);
    if (!resolved) {
      return response(404, { ok: false, error: 'not found', code: 'ERR_NOT_FOUND' }, origin);
    }
    // Cache briefly at the edge — landing config changes rarely and the
    // upstream SSR layer will also cache via Next's data cache when
    // appropriate. 60s positive, 10s negative-ish window on 404 above.
    return response(200, resolved, origin, {
      'cache-control': 'public, max-age=60, s-maxage=60',
    });
  } catch (err) {
    console.error('[landing] resolver failed', err);
    return response(500, { ok: false, error: 'internal error' }, origin);
  }
};

export const handler = withSentry(landingHandler);
