/**
 * Client-side API surface for white-label domain lifecycle.
 * Wraps the `/domains` + `/domains/{hostname}` endpoints.
 */

import type { DomainRecord, DomainStatus } from './domains';

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.myrecruiteragency.com';

type ApiError = { error?: string; code?: string };

async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });
  const json = (await res.json().catch(() => ({}))) as T & ApiError;
  if (!res.ok) {
    const err = new Error(json.error || `HTTP ${res.status}`) as Error & {
      code?: string;
      status?: number;
    };
    err.code = json.code;
    err.status = res.status;
    throw err;
  }
  return json;
}

export type AttachDomainResponse = {
  ok: true;
  domain: DomainRecord;
  next: string;
};

export type CheckDomainResponse = {
  ok: true;
  domain: DomainRecord;
  cert?: {
    certArn: string;
    status?: string;
    validationRecord?: { name: string; value: string; type: 'CNAME' };
    domainValidationStatus?: string;
  };
  dnsCheck?: {
    hostname: string;
    expected: string;
    matches: boolean;
    perResolver: Array<{ resolver: string; records: string[]; error?: string }>;
  } | null;
};

export async function listDomains(): Promise<{ ok: true; domains: DomainRecord[] }> {
  return api('/domains', { method: 'GET' });
}

export async function attachDomain(hostname: string): Promise<AttachDomainResponse> {
  return api('/domains', {
    method: 'POST',
    body: JSON.stringify({ hostname }),
  });
}

export async function checkDomain(hostname: string): Promise<CheckDomainResponse> {
  return api(`/domains/${encodeURIComponent(hostname)}`, { method: 'GET' });
}

export async function removeDomain(hostname: string): Promise<{ ok: true; status: DomainStatus }> {
  return api(`/domains/${encodeURIComponent(hostname)}`, { method: 'DELETE' });
}

export type AuditEvent = {
  id: string;
  action: string;
  actorType?: string;
  details?: Record<string, unknown>;
  timestamp: number;
  ipAddress?: string;
};

export async function fetchAuditEvents(
  scope: 'domains' | 'auth' = 'domains',
  hostname?: string,
): Promise<{ ok: true; events: AuditEvent[] }> {
  const params = new URLSearchParams({ scope });
  if (hostname) params.set('hostname', hostname);
  return api(`/audit?${params.toString()}`, { method: 'GET' });
}
