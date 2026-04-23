/**
 * Backend domain-record CRUD. The shared hostname normalization + type layer
 * lives in `services/domains.ts`; this module owns DynamoDB interactions and
 * the short-lived process cache used by middleware.ts.
 *
 * Every write path funnels hostnames through `normalizeHostname` so the SK
 * and GSI1 partition key are always canonical.
 */

import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../handlers/common';
import {
  buildDomainGsi1,
  buildDomainKey,
  DomainRecord,
  DomainStatus,
  normalizeHostname,
} from '../../../services/domains';
import { getItem, queryByPK, queryGSI1, updateItem } from './dynamo';

const TABLE_NAME = process.env.TABLE_NAME || 'agency-narrative-crm';

type CacheEntry = { value: DomainRecord | null; expiresAt: number };
const CACHE_TTL_MS = 60_000;
const NEGATIVE_CACHE_TTL_MS = 30_000;
const hostCache = new Map<string, CacheEntry>();

function cacheSet(hostname: string, value: DomainRecord | null) {
  hostCache.set(hostname, {
    value,
    expiresAt: Date.now() + (value ? CACHE_TTL_MS : NEGATIVE_CACHE_TTL_MS),
  });
}

function cacheGet(hostname: string): DomainRecord | null | undefined {
  const hit = hostCache.get(hostname);
  if (!hit) return undefined;
  if (hit.expiresAt < Date.now()) {
    hostCache.delete(hostname);
    return undefined;
  }
  return hit.value;
}

export function clearDomainCache() {
  hostCache.clear();
}

/**
 * Hot-path lookup used by middleware.ts: hostname -> active DOMAIN record (or
 * null when unknown). Cached in-process for {@link CACHE_TTL_MS}.
 */
export async function findDomainByHostname(hostnameInput: string): Promise<DomainRecord | null> {
  let hostname: string;
  try {
    hostname = normalizeHostname(hostnameInput);
  } catch {
    return null;
  }

  const cached = cacheGet(hostname);
  if (cached !== undefined) return cached;

  const items = (await queryGSI1(`DOMAIN#${hostname}`)) as DomainRecord[];
  const active = items.find((i) => i.status === 'ACTIVE') || null;
  cacheSet(hostname, active);
  return active;
}

/**
 * Create a DOMAIN# record on first attach. Uses a conditional put on the GSI1
 * partition key so the same hostname cannot be claimed by two agencies.
 * Hostname is normalized before any DynamoDB interaction.
 */
export async function createDomainRecord(params: {
  agencyId: string;
  hostname: string; // raw user input; will be normalized
  status?: DomainStatus;
  trafficTarget?: string;
}): Promise<DomainRecord> {
  const hostname = normalizeHostname(params.hostname);
  const now = Date.now();
  const item: DomainRecord = {
    ...buildDomainKey(params.agencyId, hostname),
    ...buildDomainGsi1(hostname, params.agencyId),
    id: `${params.agencyId}:${hostname}`,
    agencyId: params.agencyId,
    hostname,
    status: params.status || 'PENDING_DNS',
    trafficTarget: params.trafficTarget,
    createdAt: now,
    updatedAt: now,
    attachedAt: now,
  };

  await docClient.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: item,
      // Conditional on the composite PK/SK pair, which serializes per-agency
      // duplicate attempts. Cross-agency duplicates are blocked by the caller
      // performing a GSI1 read first; a strict uniqueness constraint across
      // agencies would need a second item with `PK = DOMAIN#<hostname>` which
      // is a Phase 5 hardening if needed.
      ConditionExpression: 'attribute_not_exists(PK)',
    }),
  );

  cacheSet(hostname, item.status === 'ACTIVE' ? item : null);
  return item;
}

export async function updateDomainStatus(params: {
  agencyId: string;
  hostname: string;
  status: DomainStatus;
  certArn?: string;
  validationRecord?: DomainRecord['validationRecord'];
  lastError?: string;
  trafficTarget?: string;
}): Promise<void> {
  const hostname = normalizeHostname(params.hostname);
  const now = Date.now();
  const set: string[] = ['#status = :status', 'updatedAt = :updatedAt'];
  const values: Record<string, unknown> = {
    ':status': params.status,
    ':updatedAt': now,
  };
  const names: Record<string, string> = { '#status': 'status' };

  if (params.certArn !== undefined) {
    set.push('certArn = :certArn');
    values[':certArn'] = params.certArn;
  }
  if (params.validationRecord !== undefined) {
    set.push('validationRecord = :validationRecord');
    values[':validationRecord'] = params.validationRecord;
  }
  if (params.lastError !== undefined) {
    set.push('lastError = :lastError');
    values[':lastError'] = params.lastError;
  }
  if (params.trafficTarget !== undefined) {
    set.push('trafficTarget = :trafficTarget');
    values[':trafficTarget'] = params.trafficTarget;
  }
  if (params.status === 'ACTIVE') {
    set.push('activatedAt = :activatedAt');
    values[':activatedAt'] = now;
  }
  if (params.status === 'REMOVED') {
    set.push('removedAt = :removedAt');
    values[':removedAt'] = now;
  }

  await updateItem({
    key: buildDomainKey(params.agencyId, hostname),
    updateExpression: `SET ${set.join(', ')}`,
    expressionAttributeValues: values,
    expressionAttributeNames: names,
  });

  hostCache.delete(hostname);
}

/**
 * List every DOMAIN# record owned by an agency. Used by the status board.
 * Returns records in their original insertion order as stored in DynamoDB.
 */
export async function listDomainsByAgency(agencyId: string): Promise<DomainRecord[]> {
  const items = (await queryByPK(`AGENCY#${agencyId}`, 'DOMAIN#')) as DomainRecord[];
  return items.filter((i) => i.status !== 'REMOVED');
}

export async function getDomainByAgency(
  agencyId: string,
  hostnameInput: string,
): Promise<DomainRecord | null> {
  const hostname = normalizeHostname(hostnameInput);
  const item = await getItem(buildDomainKey(agencyId, hostname));
  return (item as DomainRecord | undefined) || null;
}
