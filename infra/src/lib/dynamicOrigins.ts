/**
 * Phase 5c dynamic CORS allowlist.
 *
 * The static allowlist in `handlers/cors.ts` covers canonical hosts only.
 * Custom and pilot domains live in DynamoDB as `DOMAIN#<hostname>` rows
 * (see `services/domains.ts` / `infra/src/lib/domains.ts`). This module
 * lifts those rows into a small in-process cache so response handlers
 * can decide per-request whether an Origin is allowed.
 *
 * Design:
 *   - GSI1 lets us query all DOMAIN# rows by hostname; we use `status`
 *     on the row to gate ACTIVE hosts. The cache is refreshed on any
 *     hit older than CACHE_TTL_MS.
 *   - On cache miss for a specific Origin, we do a single GSI1 query
 *     for that hostname so cold starts never 100%-miss a legitimate
 *     custom host. The result is cached positively or negatively.
 *   - We never fall back to wildcard (*) because responses carry
 *     credentialed cookies -- wildcard + credentials is disallowed by
 *     browsers. A non-matching origin just gets the canonical fallback
 *     and the browser will block the cross-origin read.
 */

import { QueryCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../handlers/common';

const TABLE_NAME = process.env.TABLE_NAME || 'agency-narrative-crm';
const GSI_NAME = process.env.GSI1_NAME || 'GSI1';
const CACHE_TTL_MS = 60_000;
const NEGATIVE_CACHE_TTL_MS = 30_000;

type CacheEntry = { allowed: boolean; expiresAt: number };
const originCache = new Map<string, CacheEntry>();

function originToHostname(origin: string): string | null {
  try {
    const url = new URL(origin);
    if (url.protocol !== 'https:') return null;
    return url.hostname.toLowerCase();
  } catch {
    return null;
  }
}

async function queryDomainByHostname(hostname: string): Promise<{ status?: string } | null> {
  const res = await docClient.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: GSI_NAME,
      KeyConditionExpression: 'GSI1PK = :pk',
      ExpressionAttributeValues: { ':pk': `DOMAIN#${hostname}` },
      Limit: 1,
    }),
  );
  const item = (res.Items || [])[0];
  return (item as { status?: string } | undefined) || null;
}

export function __clearDynamicOriginsCache() {
  originCache.clear();
}

export async function isDynamicallyAllowedOrigin(origin: string): Promise<boolean> {
  const hostname = originToHostname(origin);
  if (!hostname) return false;

  const cached = originCache.get(hostname);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.allowed;
  }

  try {
    const row = await queryDomainByHostname(hostname);
    const allowed = !!row && row.status === 'ACTIVE';
    originCache.set(hostname, {
      allowed,
      expiresAt: Date.now() + (allowed ? CACHE_TTL_MS : NEGATIVE_CACHE_TTL_MS),
    });
    return allowed;
  } catch (err) {
    console.warn('[dynamicOrigins] lookup failed; defaulting to not allowed', err);
    return false;
  }
}
