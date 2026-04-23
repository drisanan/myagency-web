/**
 * Domain lifecycle types + hostname normalization.
 *
 * After Phase 3 the canonical host-to-agency mapping lives in DynamoDB:
 *   PK = AGENCY#<agencyId>     SK = DOMAIN#<hostname>
 *   GSI1PK = DOMAIN#<hostname> GSI1SK = AGENCY#<agencyId>
 *
 * See docs/02-solutions-architect/whitelabel-audit.md section 7 for the
 * normalization contract. This file is the single place every other layer
 * (middleware, domains-attach/check/remove handlers, domainValidator Lambda)
 * must funnel hostname input through.
 */

export const DOMAIN_STATUSES = [
  'PENDING_DNS',
  'VALIDATING',
  'PROVISIONING',
  'ACTIVE',
  'FAILED',
  'REMOVED',
] as const;

export type DomainStatus = (typeof DOMAIN_STATUSES)[number];

export type DomainRecord = {
  PK: string; // AGENCY#<agencyId>
  SK: string; // DOMAIN#<hostname>
  GSI1PK: string; // DOMAIN#<hostname>
  GSI1SK: string; // AGENCY#<agencyId>
  id: string;
  agencyId: string;
  hostname: string; // normalized
  status: DomainStatus;
  certArn?: string;
  validationRecord?: {
    name: string;
    value: string;
    type: 'CNAME';
  };
  trafficTarget?: string; // e.g. the CloudFront distribution alias
  lastError?: string;
  lastCheckedAt?: number;
  attachedAt?: number;
  activatedAt?: number;
  removedAt?: number;
  createdAt: number;
  updatedAt: number;
};

export const RESERVED_LABELS = [
  'www',
  'api',
  'auth',
  'mail',
  'smtp',
  'imap',
  'pop',
  'admin',
  'root',
  'ns1',
  'ns2',
  'mx',
] as const;

export class HostnameNormalizeError extends Error {
  code:
    | 'EMPTY'
    | 'INVALID_CHARS'
    | 'APEX_NOT_ALLOWED'
    | 'RESERVED_LABEL'
    | 'IDN_FAILED'
    | 'TOO_LONG';
  constructor(code: HostnameNormalizeError['code'], message: string) {
    super(message);
    this.name = 'HostnameNormalizeError';
    this.code = code;
  }
}

export function isReservedLabel(label: string): boolean {
  return (RESERVED_LABELS as readonly string[]).includes(label.toLowerCase());
}

/**
 * Apply the normalization rules from the audit:
 *   1. trim
 *   2. lowercase
 *   3. strip trailing dot
 *   4. IDN -> punycode
 *   5. reject if fewer than 3 labels (apex domain)
 *   6. reject reserved leading labels
 *   7. reject invalid DNS characters
 */
export function normalizeHostname(input: string): string {
  if (input == null) throw new HostnameNormalizeError('EMPTY', 'hostname required');
  const trimmed = String(input).trim();
  if (!trimmed) throw new HostnameNormalizeError('EMPTY', 'hostname required');

  const withoutDot = trimmed.replace(/\.$/, '').toLowerCase();
  if (!withoutDot) throw new HostnameNormalizeError('EMPTY', 'hostname required');

  let ascii: string;
  try {
    // URL normalizes Unicode to punycode when used with the `http:` scheme.
    const url = new URL(`http://${withoutDot}`);
    ascii = url.hostname;
  } catch {
    throw new HostnameNormalizeError('IDN_FAILED', 'could not parse hostname');
  }

  if (!/^[a-z0-9.-]+$/.test(ascii)) {
    throw new HostnameNormalizeError('INVALID_CHARS', 'hostname contains invalid characters');
  }
  if (ascii.length > 253) {
    throw new HostnameNormalizeError('TOO_LONG', 'hostname exceeds 253 chars');
  }

  const labels = ascii.split('.').filter(Boolean);
  if (labels.length < 3) {
    throw new HostnameNormalizeError(
      'APEX_NOT_ALLOWED',
      'apex domains are not supported in v1; use a subdomain like app.acme.com',
    );
  }

  for (const label of labels) {
    if (!label) {
      throw new HostnameNormalizeError('INVALID_CHARS', 'empty label in hostname');
    }
    if (label.length > 63) {
      throw new HostnameNormalizeError('TOO_LONG', `label "${label}" exceeds 63 chars`);
    }
    if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(label)) {
      throw new HostnameNormalizeError('INVALID_CHARS', `invalid label "${label}"`);
    }
  }

  if (isReservedLabel(labels[0])) {
    throw new HostnameNormalizeError(
      'RESERVED_LABEL',
      `leading label "${labels[0]}" is reserved`,
    );
  }

  return ascii;
}

/**
 * Pilot-only helper: returns true when the hostname lives under the internal
 * myrecruiteragency.com zone we already control. Public domain-attach handlers
 * must refuse internal pilot hosts so customers cannot grab them; only the
 * pilot seed script (Phase 3 manual pilot) may create these rows.
 */
export function isInternalPilotHost(hostname: string): boolean {
  return /(^|\.)myrecruiteragency\.com$/i.test(hostname);
}

export function buildDomainKey(agencyId: string, hostname: string) {
  return {
    PK: `AGENCY#${agencyId}`,
    SK: `DOMAIN#${hostname}`,
  };
}

export function buildDomainGsi1(hostname: string, agencyId: string) {
  return {
    GSI1PK: `DOMAIN#${hostname}`,
    GSI1SK: `AGENCY#${agencyId}`,
  };
}
