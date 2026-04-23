import type { APIGatewayProxyEventV2 } from 'aws-lambda';

process.env.SESSION_SECRET = 'test-secret-audit';

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: unknown) => fn,
  captureError: jest.fn(),
  captureMessage: jest.fn(),
}));
jest.mock('../../lib/dynamicOrigins', () => ({
  isDynamicallyAllowedOrigin: jest.fn().mockResolvedValue(false),
}));
jest.mock('../../lib/session', () => ({
  parseSessionFromRequest: jest.fn(),
}));
jest.mock('../../lib/dynamo', () => ({
  queryByPK: jest.fn(),
}));

import { handler } from '../audit';
import { parseSessionFromRequest } from '../../lib/session';
import { queryByPK } from '../../lib/dynamo';

const sessionMock = parseSessionFromRequest as jest.MockedFunction<
  typeof parseSessionFromRequest
>;
const queryMock = queryByPK as jest.MockedFunction<typeof queryByPK>;

function event(
  method: string,
  qs: Record<string, string> = {},
): APIGatewayProxyEventV2 {
  return {
    headers: { origin: 'https://app.myrecruiteragency.com' },
    queryStringParameters: qs,
    rawPath: '/audit',
    requestContext: {
      http: { method, path: '/audit', protocol: 'HTTP/1.1', sourceIp: '1.1.1.1', userAgent: 'jest' },
    },
  } as unknown as APIGatewayProxyEventV2;
}

describe('audit handler', () => {
  beforeEach(() => jest.clearAllMocks());

  it('401s without session', async () => {
    sessionMock.mockReturnValue(null);
    const res = await (handler as any)(event('GET'));
    expect(res.statusCode).toBe(401);
  });

  it('returns domain events by default, newest first', async () => {
    sessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    queryMock.mockResolvedValueOnce([
      {
        id: '1',
        action: 'domain_attached',
        details: { hostname: 'app.acme.com' },
        timestamp: 1000,
      },
      {
        id: '2',
        action: 'auth_session_minted',
        details: {},
        timestamp: 2000,
      },
      {
        id: '3',
        action: 'domain_activated',
        details: { hostname: 'app.acme.com' },
        timestamp: 3000,
      },
    ] as any);

    const res = await (handler as any)(event('GET'));
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.events.map((e: { id: string }) => e.id)).toEqual(['3', '1']);
  });

  it('filters by hostname when provided', async () => {
    sessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    queryMock.mockResolvedValueOnce([
      { id: '1', action: 'domain_attached', details: { hostname: 'a.com' }, timestamp: 1 },
      { id: '2', action: 'domain_attached', details: { hostname: 'b.com' }, timestamp: 2 },
    ] as any);

    const res = await (handler as any)(event('GET', { hostname: 'b.com' }));
    const body = JSON.parse(res.body);
    expect(body.events).toHaveLength(1);
    expect(body.events[0].id).toBe('2');
  });

  it('switches to auth scope when asked', async () => {
    sessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    queryMock.mockResolvedValueOnce([
      { id: '1', action: 'domain_attached', details: {}, timestamp: 1 },
      { id: '2', action: 'auth_session_minted', details: {}, timestamp: 2 },
    ] as any);

    const res = await (handler as any)(event('GET', { scope: 'auth' }));
    const body = JSON.parse(res.body);
    expect(body.events.map((e: { id: string }) => e.id)).toEqual(['2']);
  });
});
