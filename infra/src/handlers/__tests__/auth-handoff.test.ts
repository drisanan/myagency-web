import type { APIGatewayProxyEventV2 } from 'aws-lambda';

process.env.SESSION_SECRET = 'test-secret-handoff';
process.env.CANONICAL_HOSTS = 'myrecruiteragency.com,app.myrecruiteragency.com';

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: unknown) => fn,
}));

jest.mock('../../lib/dynamicOrigins', () => ({
  isDynamicallyAllowedOrigin: jest.fn().mockResolvedValue(false),
}));

jest.mock('../../lib/dynamo', () => ({
  queryGSI1: jest.fn(),
  putItem: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('../../lib/session', () => ({
  parseSessionFromRequest: jest.fn(),
}));

jest.mock('../../lib/handoffToken', () => ({
  mintHandoffToken: jest.fn(() => 'signed.token.value'),
}));

import { handler } from '../auth-handoff';
import { queryGSI1 } from '../../lib/dynamo';
import { parseSessionFromRequest } from '../../lib/session';
import { mintHandoffToken } from '../../lib/handoffToken';

const queryGSI1Mock = queryGSI1 as jest.MockedFunction<typeof queryGSI1>;
const parseSessionMock = parseSessionFromRequest as jest.MockedFunction<
  typeof parseSessionFromRequest
>;
const mintMock = mintHandoffToken as jest.MockedFunction<typeof mintHandoffToken>;

function makeEvent(query: Record<string, string>, method = 'GET'): APIGatewayProxyEventV2 {
  return {
    version: '2.0',
    routeKey: '',
    rawPath: '/auth/handoff',
    rawQueryString: '',
    headers: { origin: 'https://app.myrecruiteragency.com' },
    cookies: [],
    queryStringParameters: query,
    requestContext: {
      accountId: '',
      apiId: '',
      domainName: '',
      domainPrefix: '',
      http: {
        method,
        path: '/auth/handoff',
        protocol: 'HTTP/1.1',
        sourceIp: '127.0.0.1',
        userAgent: 'jest',
      },
      requestId: '',
      routeKey: '',
      stage: '',
      time: '',
      timeEpoch: 0,
    },
    isBase64Encoded: false,
  } as unknown as APIGatewayProxyEventV2;
}

describe('auth-handoff handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mintMock.mockReturnValue('signed.token.value');
  });

  it('401s when no canonical session present', async () => {
    parseSessionMock.mockReturnValue(null);
    const res = await (handler as any)(
      makeEvent({ return_to: 'https://pilot1.myrecruiteragency.com/dashboard' }),
    );
    expect(res.statusCode).toBe(401);
    expect(JSON.parse(res.body).code).toBe('ERR_HANDOFF_NO_SESSION');
  });

  it('400s on malformed return_to', async () => {
    parseSessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    const res = await (handler as any)(makeEvent({ return_to: 'not a url' }));
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).code).toBe('ERR_HANDOFF_BAD_RETURN_TO');
  });

  it('400s if return_to host is canonical', async () => {
    parseSessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    const res = await (handler as any)(
      makeEvent({ return_to: 'https://app.myrecruiteragency.com/dashboard' }),
    );
    expect(res.statusCode).toBe(400);
    expect(JSON.parse(res.body).code).toBe('ERR_HANDOFF_CANONICAL_TARGET');
  });

  it('403s when DOMAIN# row missing or not active', async () => {
    parseSessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    queryGSI1Mock.mockResolvedValueOnce([]);
    const res = await (handler as any)(
      makeEvent({ return_to: 'https://pilot1.myrecruiteragency.com/dashboard' }),
    );
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body).code).toBe('ERR_HANDOFF_HOST_NOT_ATTACHED');
  });

  it('403s when target host belongs to a different agency', async () => {
    parseSessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    queryGSI1Mock.mockResolvedValueOnce([
      { agencyId: 'a2', status: 'ACTIVE' } as any,
    ]);
    const res = await (handler as any)(
      makeEvent({ return_to: 'https://pilot1.myrecruiteragency.com/dashboard' }),
    );
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body).code).toBe('ERR_HANDOFF_AGENCY_MISMATCH');
  });

  it('200s with a signed redirectUrl on the target host', async () => {
    parseSessionMock.mockReturnValue({
      agencyId: 'a1',
      role: 'agency',
      agencyEmail: 'a@b.c',
    } as any);
    queryGSI1Mock.mockResolvedValueOnce([
      { agencyId: 'a1', status: 'ACTIVE' } as any,
    ]);

    const res = await (handler as any)(
      makeEvent({ return_to: 'https://pilot1.myrecruiteragency.com/dashboard?x=1' }),
    );
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body);
    expect(body.ok).toBe(true);
    expect(body.targetHost).toBe('pilot1.myrecruiteragency.com');
    const url = new URL(body.redirectUrl);
    expect(url.origin).toBe('https://pilot1.myrecruiteragency.com');
    expect(url.pathname).toBe('/auth/handoff');
    expect(url.searchParams.get('token')).toBe('signed.token.value');
    expect(url.searchParams.get('return_to')).toBe('/dashboard?x=1');
    expect(mintMock).toHaveBeenCalledWith(
      expect.objectContaining({ agencyId: 'a1', role: 'agency' }),
    );
  });
});
