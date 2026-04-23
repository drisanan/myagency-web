#!/usr/bin/env node
/**
 * Phase 3 pilot seeder: attaches two internal subdomains to existing agency
 * records so we can prove host-based tenancy end-to-end without touching ACM
 * or CloudFront yet.
 *
 * The expectation is that the two pilot hostnames already CNAME to the
 * existing Amplify host (myrecruiteragency.com's Amplify distribution). No
 * cert issuance happens here -- Amplify covers *.myrecruiteragency.com.
 *
 * Usage:
 *   AWS_REGION=us-west-1 \
 *   TABLE_NAME=agency-narrative-crm \
 *   PILOT_HOST_1=pilot1.myrecruiteragency.com \
 *   PILOT_AGENCY_1=agency-001 \
 *   PILOT_HOST_2=pilot2.myrecruiteragency.com \
 *   PILOT_AGENCY_2=agency-002 \
 *   node scripts/seed-pilot-domains.mjs
 *
 * Idempotent: reruns overwrite the DOMAIN# row but preserve createdAt when
 * a previous row exists.
 *
 * See docs/02-solutions-architect/whitelabel-pilot-runbook.md
 */

import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';

const REGION = process.env.AWS_REGION || 'us-west-1';
const TABLE_NAME = process.env.TABLE_NAME || 'agency-narrative-crm';

const client = new DynamoDBClient({ region: REGION });
const doc = DynamoDBDocumentClient.from(client);

function normalizeHostname(raw) {
  const trimmed = String(raw || '').trim().toLowerCase().replace(/\.$/, '');
  if (!trimmed) throw new Error('empty hostname');
  if (!/^[a-z0-9.-]+$/.test(trimmed)) throw new Error(`invalid chars in ${raw}`);
  if (trimmed.split('.').length < 3) {
    throw new Error(`apex not allowed: ${trimmed}`);
  }
  return trimmed;
}

async function upsertDomain({ hostname, agencyId }) {
  const normalized = normalizeHostname(hostname);
  const existing = await doc.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: { PK: `AGENCY#${agencyId}`, SK: `DOMAIN#${normalized}` },
    }),
  );

  const now = Date.now();
  const createdAt = existing?.Item?.createdAt || now;

  const item = {
    PK: `AGENCY#${agencyId}`,
    SK: `DOMAIN#${normalized}`,
    GSI1PK: `DOMAIN#${normalized}`,
    GSI1SK: `AGENCY#${agencyId}`,
    id: `${agencyId}:${normalized}`,
    agencyId,
    hostname: normalized,
    status: 'ACTIVE',
    source: 'pilot-seed',
    createdAt,
    updatedAt: now,
  };

  await doc.send(new PutCommand({ TableName: TABLE_NAME, Item: item }));
  console.log(`✓ upsert DOMAIN#${normalized} -> AGENCY#${agencyId}`);
}

async function main() {
  const pairs = [
    { hostname: process.env.PILOT_HOST_1, agencyId: process.env.PILOT_AGENCY_1 },
    { hostname: process.env.PILOT_HOST_2, agencyId: process.env.PILOT_AGENCY_2 },
  ].filter((p) => p.hostname && p.agencyId);

  if (pairs.length === 0) {
    console.error(
      'No pilot pairs configured. Set PILOT_HOST_1/PILOT_AGENCY_1 and PILOT_HOST_2/PILOT_AGENCY_2.',
    );
    process.exit(1);
  }

  for (const pair of pairs) {
    await upsertDomain(pair);
  }

  console.log('\nDone. To verify:');
  console.log(`  aws dynamodb query --table-name ${TABLE_NAME} --index-name GSI1 \\`);
  console.log('    --key-condition-expression "GSI1PK = :pk" \\');
  console.log(
    '    --expression-attribute-values \'{":pk":{"S":"DOMAIN#pilot1.myrecruiteragency.com"}}\'',
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
