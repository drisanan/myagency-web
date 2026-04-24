/**
 * Server-side resolver: hostname -> agency settings + landing config.
 *
 * Used by the Next.js landing route (Node runtime server component). The
 * middleware captures the Host header and rewrites to `/landing?host=<host>`;
 * this resolver is the bridge into the public `GET /landing` API, which in
 * turn reads DynamoDB.
 *
 * Important: SSR runs on Amplify WEB_COMPUTE, whose Lambda execution role
 * does NOT have DynamoDB permissions (and sits in a different region than
 * the DDB table). So we never talk to DynamoDB directly from the SSR
 * process — we proxy through the API. This keeps the SSR layer a pure
 * renderer and makes IAM responsibilities clear (API owns DDB; SSR owns
 * HTML).
 */

import type {
  AgencyLandingConfig,
  AgencyRecord,
  AgencySettings,
} from '../infra/src/lib/models';
import type { DomainRecord } from './domains';

export type { AgencyLandingConfig };

export type ResolvedLanding = {
  agency: AgencyRecord;
  domain: DomainRecord;
  landing: AgencyLandingConfig;
  /** true when served via `/landing?agencyId=…` preview (no real custom host). */
  isPreview: boolean;
  /**
   * Most-recent ACTIVE custom domain for this agency, if any. Used to build
   * the canonical URL on preview + fallback renders.
   */
  activeCustomHostname: string | null;
};

type LandingApiResponse = {
  ok: true;
  agency: {
    id: string;
    name: string;
    slug?: string;
    settings: AgencySettings;
  };
  domain: DomainRecord;
  landing: AgencyLandingConfig;
  isPreview: boolean;
  activeCustomHostname: string | null;
};

const API_BASE =
  process.env.API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://api.myrecruiteragency.com';

async function fetchLanding(params: URLSearchParams): Promise<ResolvedLanding | null> {
  const url = `${API_BASE.replace(/\/$/, '')}/landing?${params.toString()}`;
  let res: Response;
  try {
    res = await fetch(url, {
      method: 'GET',
      headers: { accept: 'application/json' },
      // Next.js server-side fetch cache: revalidate every 60s so landing
      // edits propagate promptly without hammering the API on each request.
      next: { revalidate: 60 },
    } as RequestInit & { next?: { revalidate: number } });
  } catch (err) {
    console.error('[landingResolver] fetch failed', { url, err });
    return null;
  }

  if (res.status === 404) return null;
  if (!res.ok) {
    console.error('[landingResolver] non-OK response', { url, status: res.status });
    return null;
  }

  let body: LandingApiResponse;
  try {
    body = (await res.json()) as LandingApiResponse;
  } catch (err) {
    console.error('[landingResolver] bad JSON', { url, err });
    return null;
  }
  if (!body?.ok) return null;

  // Shape the API payload into the `AgencyRecord`-ish object templates
  // expect. We only surface the public-safe subset (id, name, slug,
  // settings); the API endpoint strips everything else.
  const agency = {
    PK: `AGENCY#${body.agency.id}`,
    SK: 'PROFILE',
    GSI1PK: '',
    GSI1SK: '',
    id: body.agency.id,
    name: body.agency.name,
    email: '',
    slug: body.agency.slug,
    settings: body.agency.settings,
  } as AgencyRecord;

  return {
    agency,
    domain: body.domain,
    landing: body.landing,
    isPreview: body.isPreview,
    activeCustomHostname: body.activeCustomHostname,
  };
}

export async function resolveLandingByHostname(
  hostnameInput: string,
): Promise<ResolvedLanding | null> {
  if (!hostnameInput) return null;
  const params = new URLSearchParams({ host: hostnameInput });
  return fetchLanding(params);
}

export async function resolveLandingByAgencyId(
  agencyId: string,
): Promise<ResolvedLanding | null> {
  if (!agencyId) return null;
  const params = new URLSearchParams({ agencyId });
  return fetchLanding(params);
}
