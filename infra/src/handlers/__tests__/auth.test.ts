/**
 * @jest-environment node
 *
 * Permission matrix for POST /auth/session after Phase 1 hardening.
 * See docs/02-solutions-architect/whitelabel-audit.md for the contract.
 */

process.env.SESSION_SECRET = process.env.SESSION_SECRET || 'test-session-secret';
process.env.COOKIE_DOMAIN = process.env.COOKIE_DOMAIN || '.myrecruiteragency.com';

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: Function) => fn,
}));

jest.mock('../../lib/dynamicOrigins', () => ({
  isDynamicallyAllowedOrigin: jest.fn().mockResolvedValue(false),
}));

jest.mock('../../lib/dynamo', () => {
  const actual = jest.requireActual('../../lib/dynamo');
  return {
    ...actual,
    putItem: jest.fn(async (item: any) => item),
    getItem: jest.fn(async () => undefined),
    queryByPK: jest.fn(async () => []),
  };
});

// Mock the handoff token consumer so we can flip single-use semantics per test
// without a real DynamoDB. Signature + expiry are still end-to-end real.
const consumeMock = jest.fn<Promise<boolean>, [string]>().mockResolvedValue(true);
jest.mock('../../lib/handoffToken', () => {
  const real = jest.requireActual('../../lib/handoffToken');
  return {
    ...real,
    consumeHandoffToken: (jti: string) => consumeMock(jti),
  };
});

import { handler } from '../auth';
import { mintHandoffToken } from '../../lib/handoffToken';

const ORIGIN = 'http://localhost:3000';

function makeEvent(method: string, body?: any, cookies?: string) {
  return {
    requestContext: { http: { method } },
    body: body ? JSON.stringify(body) : undefined,
    headers: {
      ...(cookies ? { cookie: cookies } : {}),
      origin: ORIGIN,
      'x-forwarded-proto': 'http',
      host: 'localhost:3000',
    },
  } as any;
}

function okHandoff() {
  return mintHandoffToken({
    agencyId: 'agency-001',
    email: 'agency1@an.test',
    role: 'agency',
    userId: 'u1',
    source: 'ghl-login',
  });
}

describe('auth handler POST permission matrix', () => {
  beforeEach(() => {
    consumeMock.mockReset();
    consumeMock.mockResolvedValue(true);
  });

  it('rejects body-only mint with 401 ERR_AUTH_NO_HANDOFF', async () => {
    const res = (await handler(
      makeEvent('POST', { agencyId: 'agency-001', email: 'agency1@an.test', role: 'agency', userId: 'u1' }),
    )) as any;
    expect(res.statusCode).toBe(401);
    const body = JSON.parse(res.body);
    expect(body.code).toBe('ERR_AUTH_NO_HANDOFF');
  });

  it('accepts a valid handoff token and sets cookie', async () => {
    const res = (await handler(makeEvent('POST', { handoffToken: okHandoff() }))) as any;
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.session?.agencyId).toBe('agency-001');
    // Local dev path puts cookie on X-Local-Set-Cookie; prod path populates res.cookies
    const hasCookie =
      (res.headers && typeof res.headers['X-Local-Set-Cookie'] === 'string' &&
        res.headers['X-Local-Set-Cookie'].includes('an_session=')) ||
      (Array.isArray(res.cookies) && res.cookies.some((c: string) => c.includes('an_session=')));
    expect(hasCookie).toBe(true);
  });

  it('rejects a reused handoff token with ERR_AUTH_HANDOFF_USED', async () => {
    consumeMock.mockResolvedValueOnce(false);
    const res = (await handler(makeEvent('POST', { handoffToken: okHandoff() }))) as any;
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).code).toBe('ERR_AUTH_HANDOFF_USED');
  });

  it('rejects an expired handoff token with ERR_AUTH_HANDOFF_EXPIRED', async () => {
    const expired = mintHandoffToken(
      { agencyId: 'a', email: 'b', role: 'agency', source: 'ghl-login' },
      Date.now() - 120_000,
    );
    const res = (await handler(makeEvent('POST', { handoffToken: expired }))) as any;
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).code).toBe('ERR_AUTH_HANDOFF_EXPIRED');
  });

  it('rejects a tampered handoff token with ERR_AUTH_HANDOFF_BAD', async () => {
    const token = okHandoff();
    const bad = token.slice(0, -4) + 'XXXX';
    const res = (await handler(makeEvent('POST', { handoffToken: bad }))) as any;
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).code).toBe('ERR_AUTH_HANDOFF_BAD');
  });

  it('rejects POST with no body', async () => {
    const res = (await handler({
      requestContext: { http: { method: 'POST' } },
      headers: { origin: ORIGIN },
    } as any)) as any;
    expect(res.statusCode).toBe(400);
  });
});

describe('auth handler GET/DELETE/OPTIONS', () => {
  beforeEach(() => {
    consumeMock.mockReset();
    consumeMock.mockResolvedValue(true);
  });

  it('returns session on GET after valid POST', async () => {
    const post = (await handler(makeEvent('POST', { handoffToken: okHandoff() }))) as any;
    const cookie =
      (post.headers && post.headers['X-Local-Set-Cookie']) ||
      (Array.isArray(post.cookies) ? post.cookies[0] : '');
    expect(cookie).toContain('an_session=');
    const get = (await handler(makeEvent('GET', undefined, cookie))) as any;
    const body = JSON.parse(get.body || '{}');
    expect(body.session?.agencyId).toBe('agency-001');
  });

  it('clears cookie on DELETE', async () => {
    const res = (await handler(makeEvent('DELETE'))) as any;
    const cleared =
      (res.headers && typeof res.headers['X-Local-Set-Cookie'] === 'string' &&
        res.headers['X-Local-Set-Cookie'].includes('Max-Age=0')) ||
      (Array.isArray(res.cookies) && res.cookies.some((c: string) => c.includes('Max-Age=0')));
    expect(cleared).toBe(true);
  });

  it('handles OPTIONS', async () => {
    const res = (await handler(makeEvent('OPTIONS'))) as any;
    expect(res.statusCode).toBe(200);
  });
});
