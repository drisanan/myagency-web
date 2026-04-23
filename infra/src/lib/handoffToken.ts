/**
 * Session handoff token.
 *
 * Phase 1 security remediation: POST /auth/session can no longer mint a session
 * from raw {agencyId, email, role} in the body. Instead, the three legitimate
 * upstream login paths (GHL login, client portal login, Google OAuth callback)
 * mint a short-lived HMAC-signed handoff token after verifying credentials, and
 * /auth/session verifies + consumes that token before minting the real cookie.
 *
 * Guarantees:
 *   - Tamper-evident: HMAC-SHA256 with SESSION_SECRET.
 *   - Time-bound: 60 second TTL.
 *   - Single-use: jti recorded via conditional DynamoDB write; replay returns ERR_AUTH_HANDOFF_USED.
 *   - Minimal claims: only what /auth/session needs to construct a SessionContext.
 *
 * See docs/02-solutions-architect/whitelabel-audit.md for the permission matrix this encodes.
 */

import { createHmac, randomBytes, timingSafeEqual } from 'crypto';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { docClient } from '../handlers/common';

const TTL_SECONDS = 60;
const TABLE_NAME = process.env.TABLE_NAME || 'agency-narrative-crm';

export type HandoffSource = 'ghl-login' | 'client-login' | 'google-oauth';

export type HandoffClaims = {
  agencyId: string;
  email: string;
  role: 'agency' | 'client' | 'agent' | 'admin' | 'athlete';
  userId?: string;
  firstName?: string;
  lastName?: string;
  source: HandoffSource;
};

export type HandoffTokenPayload = HandoffClaims & {
  iat: number;
  exp: number;
  jti: string;
};

export type HandoffVerifyResult =
  | { ok: true; payload: HandoffTokenPayload }
  | { ok: false; code: 'ERR_AUTH_HANDOFF_BAD' | 'ERR_AUTH_HANDOFF_EXPIRED' };

function getSecret(): string {
  const s = process.env.SESSION_SECRET?.trim();
  if (!s) throw new Error('SESSION_SECRET is not configured');
  return s;
}

function sign(payload: string, secret: string): string {
  return createHmac('sha256', secret).update(payload).digest('base64url');
}

/**
 * Mint a signed handoff token. Must only be called after an upstream credential
 * verification has passed. Callers are responsible for the claims they pack in.
 */
export function mintHandoffToken(claims: HandoffClaims, now: number = Date.now()): string {
  if (!claims.agencyId) throw new Error('handoff: agencyId required');
  if (!claims.email) throw new Error('handoff: email required');
  if (!claims.role) throw new Error('handoff: role required');
  if (!claims.source) throw new Error('handoff: source required');

  const iat = Math.floor(now / 1000);
  const exp = iat + TTL_SECONDS;
  const jti = randomBytes(16).toString('base64url');
  const body: HandoffTokenPayload = { ...claims, iat, exp, jti };
  const encoded = Buffer.from(JSON.stringify(body)).toString('base64url');
  const sig = sign(encoded, getSecret());
  return `${encoded}.${sig}`;
}

/**
 * Verify signature and expiry. Does NOT mark the token as consumed -- callers
 * must then call {@link consumeHandoffToken} inside the minting flow to atomically
 * claim the jti. This split lets tests exercise signature/expiry without DDB.
 */
export function verifyHandoffToken(
  token: string,
  now: number = Date.now(),
): HandoffVerifyResult {
  if (!token || typeof token !== 'string') {
    return { ok: false, code: 'ERR_AUTH_HANDOFF_BAD' };
  }
  const dot = token.lastIndexOf('.');
  if (dot < 0) return { ok: false, code: 'ERR_AUTH_HANDOFF_BAD' };

  const encoded = token.slice(0, dot);
  const providedSig = token.slice(dot + 1);

  let expected: string;
  try {
    expected = sign(encoded, getSecret());
  } catch {
    return { ok: false, code: 'ERR_AUTH_HANDOFF_BAD' };
  }

  const a = Buffer.from(providedSig);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return { ok: false, code: 'ERR_AUTH_HANDOFF_BAD' };
  }

  let payload: HandoffTokenPayload;
  try {
    payload = JSON.parse(Buffer.from(encoded, 'base64url').toString('utf8')) as HandoffTokenPayload;
  } catch {
    return { ok: false, code: 'ERR_AUTH_HANDOFF_BAD' };
  }

  if (!payload || !payload.jti || !payload.exp || !payload.iat) {
    return { ok: false, code: 'ERR_AUTH_HANDOFF_BAD' };
  }

  const nowSec = Math.floor(now / 1000);
  if (payload.exp < nowSec) {
    return { ok: false, code: 'ERR_AUTH_HANDOFF_EXPIRED' };
  }

  return { ok: true, payload };
}

/**
 * Atomically claim the jti so this token can never be used again.
 * Uses a DynamoDB conditional put: succeeds exactly once per jti.
 * Rows carry a TTL so the table is self-cleaning.
 */
export async function consumeHandoffToken(jti: string, ttlSeconds: number = 3600): Promise<boolean> {
  try {
    await docClient.send(
      new PutCommand({
        TableName: TABLE_NAME,
        Item: {
          PK: `SESSION_HANDOFF#${jti}`,
          SK: 'META',
          jti,
          usedAt: Date.now(),
          ttl: Math.floor(Date.now() / 1000) + ttlSeconds,
        },
        ConditionExpression: 'attribute_not_exists(PK)',
      }),
    );
    return true;
  } catch (err: unknown) {
    if (
      err &&
      typeof err === 'object' &&
      'name' in err &&
      (err as { name?: string }).name === 'ConditionalCheckFailedException'
    ) {
      return false;
    }
    throw err;
  }
}
