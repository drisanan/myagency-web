/**
 * @jest-environment node
 */
import { handler } from '../auth-client-login';

const ORIGIN = 'http://localhost:3000';

jest.mock('../common', () => {
  const original = jest.requireActual('../common');
  return {
    ...original,
    requireSession: jest.fn(() => ({ agencyId: 'agency-001', agencyEmail: 'agency1@an.test', role: 'agency' })),
  };
});

jest.mock('../../lib/dynamo', () => {
  return {
    queryGSI1: jest.fn(),
    getItem: jest.fn(),
  };
});

jest.mock('../../lib/auth', () => {
  return {
    verifyAccessCode: jest.fn(async () => true),
  };
});

jest.mock('../../lib/activity', () => {
  return {
    logActivity: jest.fn(),
  };
});

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: Function) => fn,
}));

const { queryGSI1 } = jest.requireMock('../../lib/dynamo');

function makeEvent(body: any) {
  return {
    requestContext: { http: { method: 'POST' } },
    headers: { origin: ORIGIN },
    body: JSON.stringify(body),
  } as any;
}

describe('auth-client-login handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('blocks suspended accounts', async () => {
    queryGSI1.mockResolvedValue([
      {
        id: 'c1',
        email: 'test@example.com',
        phone: '5551234',
        accessCodeHash: 'hash',
        accountStatus: 'suspended',
        agencyId: 'agency-001',
      },
    ]);
    const res = (await handler(makeEvent({ email: 'test@example.com', phone: '5551234', accessCode: '1234' }))) as any;
    expect(res.statusCode).toBe(403);
    const body = JSON.parse(res.body || '{}');
    expect(body.error).toBe('Account suspended');
  });

  it('allows active accounts', async () => {
    queryGSI1.mockResolvedValue([
      {
        id: 'c1',
        email: 'test@example.com',
        phone: '5551234',
        accessCodeHash: 'hash',
        accountStatus: 'active',
        agencyId: 'agency-001',
        agencyEmail: 'agency1@an.test',
      },
    ]);
    const res = (await handler(makeEvent({ email: 'test@example.com', phone: '5551234', accessCode: '1234' }))) as any;
    expect(res.statusCode).toBe(200);
  });
});
