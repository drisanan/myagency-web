/**
 * @jest-environment node
 */

process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret';

import {
  mintHandoffToken,
  verifyHandoffToken,
  HandoffClaims,
} from '../handoffToken';

const claims: HandoffClaims = {
  agencyId: 'agency-001',
  email: 'agency1@an.test',
  role: 'agency',
  source: 'ghl-login',
};

describe('handoffToken', () => {
  it('mints and verifies a valid token', () => {
    const token = mintHandoffToken(claims);
    const result = verifyHandoffToken(token);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.payload.agencyId).toBe('agency-001');
      expect(result.payload.role).toBe('agency');
      expect(result.payload.jti).toBeTruthy();
      expect(result.payload.exp).toBeGreaterThan(result.payload.iat);
    }
  });

  it('rejects an empty token', () => {
    const result = verifyHandoffToken('');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('ERR_AUTH_HANDOFF_BAD');
  });

  it('rejects a token with no signature separator', () => {
    const result = verifyHandoffToken('not-a-token');
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('ERR_AUTH_HANDOFF_BAD');
  });

  it('rejects a token with a tampered payload', () => {
    const token = mintHandoffToken(claims);
    const [, sig] = token.split('.');
    const bogus = Buffer.from(
      JSON.stringify({ ...claims, iat: 0, exp: 9999999999, jti: 'x' }),
    ).toString('base64url');
    const result = verifyHandoffToken(`${bogus}.${sig}`);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('ERR_AUTH_HANDOFF_BAD');
  });

  it('rejects a token with a tampered signature', () => {
    const token = mintHandoffToken(claims);
    const [encoded] = token.split('.');
    const result = verifyHandoffToken(`${encoded}.invalid`);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('ERR_AUTH_HANDOFF_BAD');
  });

  it('rejects an expired token', () => {
    const pastTime = Date.now() - 120_000;
    const token = mintHandoffToken(claims, pastTime);
    const result = verifyHandoffToken(token);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.code).toBe('ERR_AUTH_HANDOFF_EXPIRED');
  });

  it('requires agencyId, email, role, source', () => {
    expect(() => mintHandoffToken({ ...claims, agencyId: '' } as any)).toThrow(/agencyId/);
    expect(() => mintHandoffToken({ ...claims, email: '' } as any)).toThrow(/email/);
    expect(() => mintHandoffToken({ ...claims, role: '' } as any)).toThrow(/role/);
    expect(() => mintHandoffToken({ ...claims, source: '' } as any)).toThrow(/source/);
  });

  it('gives each token a unique jti', () => {
    const a = mintHandoffToken(claims);
    const b = mintHandoffToken(claims);
    const va = verifyHandoffToken(a);
    const vb = verifyHandoffToken(b);
    if (va.ok && vb.ok) {
      expect(va.payload.jti).not.toBe(vb.payload.jti);
    }
  });
});
