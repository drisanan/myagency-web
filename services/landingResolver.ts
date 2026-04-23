/**
 * Server-side resolver: hostname -> agency settings + landing config.
 *
 * Used by the Next.js landing route (Node runtime server component). The
 * middleware captures the Host header and rewrites to `/landing?host=<host>`;
 * this resolver is the bridge into DynamoDB.
 *
 * Read-path only. All mutations of DOMAIN# rows happen through the
 * infra-side `services/domains.ts` + `infra/src/lib/domains.ts` service.
 */

import { getItem, queryByPK, queryGSI1 } from '../infra-adapter/dynamo';
import { normalizeHostname } from './domains';
import type { DomainRecord } from './domains';
import type { AgencyLandingConfig, AgencyRecord } from '../infra/src/lib/models';

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

export async function resolveLandingByHostname(
  hostnameInput: string,
): Promise<ResolvedLanding | null> {
  let hostname: string;
  try {
    hostname = normalizeHostname(hostnameInput);
  } catch {
    return null;
  }

  const domainItems = (await queryGSI1(`DOMAIN#${hostname}`)) as DomainRecord[];
  const domain = domainItems.find((d) => d.status === 'ACTIVE');
  if (!domain) return null;

  const agency = (await getItem({ PK: `AGENCY#${domain.agencyId}`, SK: 'PROFILE' })) as
    | AgencyRecord
    | undefined;
  if (!agency) return null;

  const landing: AgencyLandingConfig = agency.settings?.landing || {};

  return {
    agency,
    domain,
    landing,
    isPreview: false,
    activeCustomHostname: domain.hostname,
  };
}

export async function resolveLandingByAgencyId(
  agencyId: string,
): Promise<ResolvedLanding | null> {
  const agency = (await getItem({ PK: `AGENCY#${agencyId}`, SK: 'PROFILE' })) as
    | AgencyRecord
    | undefined;
  if (!agency) return null;
  const landing: AgencyLandingConfig = agency.settings?.landing || {};

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

  const ownedDomains = (await queryByPK(`AGENCY#${agencyId}`, 'DOMAIN#')) as DomainRecord[];
  const activeDomain = ownedDomains.find((d) => d.status === 'ACTIVE');

  return {
    agency,
    domain: synthetic,
    landing,
    isPreview: true,
    activeCustomHostname: activeDomain?.hostname || null,
  };
}
