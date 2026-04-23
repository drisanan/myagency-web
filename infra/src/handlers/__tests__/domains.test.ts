import type { APIGatewayProxyEventV2 } from 'aws-lambda';

process.env.SESSION_SECRET = 'test-secret-domains';
process.env.EDGE_DISTRIBUTION_ID = 'DIST123';
process.env.EDGE_TRAFFIC_TARGET = 'd123.cloudfront.net';

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

jest.mock('../../lib/domains', () => ({
  createDomainRecord: jest.fn(),
  findDomainByHostname: jest.fn(),
  getDomainByAgency: jest.fn(),
  listDomainsByAgency: jest.fn().mockResolvedValue([]),
  updateDomainStatus: jest.fn(),
}));

jest.mock('../../lib/acmCerts', () => ({
  requestCertificateForHost: jest.fn(),
  describeCertificateValidation: jest.fn(),
  deleteCertificateArn: jest.fn(),
}));

jest.mock('../../lib/cloudfrontEdge', () => ({
  attachAliasToDistribution: jest.fn(),
  detachAliasFromDistribution: jest.fn(),
}));

jest.mock('../../lib/domainValidator', () => ({
  checkCnameMatches: jest.fn().mockResolvedValue({
    hostname: 'app.acme.com',
    expected: 'd123.cloudfront.net',
    matches: true,
    perResolver: [],
  }),
}));

jest.mock('../../lib/dynamo', () => ({
  putItem: jest.fn().mockResolvedValue(undefined),
  // Not used by this handler but imports bring it in transitively
  getItem: jest.fn(),
  queryGSI1: jest.fn(),
  updateItem: jest.fn(),
}));

import { handler } from '../domains';
import { resetRateLimit } from '../../lib/rateLimit';
import { parseSessionFromRequest } from '../../lib/session';
import {
  createDomainRecord,
  findDomainByHostname,
  getDomainByAgency,
  updateDomainStatus,
} from '../../lib/domains';
import {
  requestCertificateForHost,
  describeCertificateValidation,
  deleteCertificateArn,
} from '../../lib/acmCerts';
import {
  attachAliasToDistribution,
  detachAliasFromDistribution,
} from '../../lib/cloudfrontEdge';

const parseSessionMock = parseSessionFromRequest as jest.MockedFunction<
  typeof parseSessionFromRequest
>;
const createDomainMock = createDomainRecord as jest.MockedFunction<typeof createDomainRecord>;
const findDomainMock = findDomainByHostname as jest.MockedFunction<typeof findDomainByHostname>;
const getDomainMock = getDomainByAgency as jest.MockedFunction<typeof getDomainByAgency>;
const updateStatusMock = updateDomainStatus as jest.MockedFunction<typeof updateDomainStatus>;
const requestCertMock = requestCertificateForHost as jest.MockedFunction<
  typeof requestCertificateForHost
>;
const describeCertMock = describeCertificateValidation as jest.MockedFunction<
  typeof describeCertificateValidation
>;
const deleteCertMock = deleteCertificateArn as jest.MockedFunction<typeof deleteCertificateArn>;
const attachMock = attachAliasToDistribution as jest.MockedFunction<
  typeof attachAliasToDistribution
>;
const detachMock = detachAliasFromDistribution as jest.MockedFunction<
  typeof detachAliasFromDistribution
>;

function event(
  method: string,
  path: string,
  body?: unknown,
): APIGatewayProxyEventV2 {
  return {
    headers: { origin: 'https://app.myrecruiteragency.com' },
    body: body ? JSON.stringify(body) : undefined,
    rawPath: path,
    requestContext: {
      http: { method, path, protocol: 'HTTP/1.1', sourceIp: '1.1.1.1', userAgent: 'jest' },
    },
  } as unknown as APIGatewayProxyEventV2;
}

describe('domains handler — attach', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    resetRateLimit();
  });

  it('401s without agency session', async () => {
    parseSessionMock.mockReturnValue(null);
    const res = await (handler as any)(event('POST', '/domains', { hostname: 'app.acme.com' }));
    expect(res.statusCode).toBe(401);
  });

  it('403s for internal pilot hosts', async () => {
    parseSessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    const res = await (handler as any)(
      event('POST', '/domains', { hostname: 'pilot9.myrecruiteragency.com' }),
    );
    expect(res.statusCode).toBe(403);
    expect(JSON.parse(res.body).code).toBe('ERR_PILOT_RESERVED');
  });

  it('409s when host is claimed by another agency', async () => {
    parseSessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    findDomainMock.mockResolvedValueOnce({ agencyId: 'a2', hostname: 'app.acme.com' } as any);
    const res = await (handler as any)(
      event('POST', '/domains', { hostname: 'app.acme.com' }),
    );
    expect(res.statusCode).toBe(409);
    expect(JSON.parse(res.body).code).toBe('ERR_HOST_CLAIMED');
  });

  it('201s + requests cert + persists PENDING_DNS', async () => {
    parseSessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    findDomainMock.mockResolvedValueOnce(null);
    requestCertMock.mockResolvedValueOnce({ certArn: 'arn:1', hostname: 'app.acme.com' });
    createDomainMock.mockResolvedValueOnce({
      agencyId: 'a1',
      hostname: 'app.acme.com',
      status: 'PENDING_DNS',
    } as any);

    const res = await (handler as any)(
      event('POST', '/domains', { hostname: 'app.acme.com' }),
    );
    expect(res.statusCode).toBe(201);
    expect(requestCertMock).toHaveBeenCalledWith({
      agencyId: 'a1',
      hostname: 'app.acme.com',
    });
    expect(updateStatusMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'PENDING_DNS', certArn: 'arn:1' }),
    );
  });

  it('429s after the rate limit is exhausted', async () => {
    const prev = process.env.DOMAIN_ATTACH_RATE_LIMIT;
    process.env.DOMAIN_ATTACH_RATE_LIMIT = '2';
    // Re-import the handler so it picks up the smaller limit.
    jest.resetModules();
    const { handler: limited } = await import('../domains');
    const { resetRateLimit: reset } = await import('../../lib/rateLimit');
    reset();

    // Re-mock session because the new module graph resolves a fresh session lib
    const { parseSessionFromRequest: freshParse } = await import('../../lib/session');
    (freshParse as jest.Mock).mockReturnValue({ agencyId: 'rl', role: 'agency' });
    const { findDomainByHostname: freshFind } = await import('../../lib/domains');
    (freshFind as jest.Mock).mockResolvedValue(null);
    const { requestCertificateForHost: freshReq } = await import('../../lib/acmCerts');
    (freshReq as jest.Mock).mockResolvedValue({ certArn: 'arn:rl', hostname: 'a.acme.com' });
    const { createDomainRecord: freshCreate } = await import('../../lib/domains');
    (freshCreate as jest.Mock).mockResolvedValue({
      agencyId: 'rl',
      hostname: 'a.acme.com',
      status: 'PENDING_DNS',
    });

    const r1 = await (limited as any)(event('POST', '/domains', { hostname: 'a.acme.com' }));
    const r2 = await (limited as any)(event('POST', '/domains', { hostname: 'b.acme.com' }));
    const r3 = await (limited as any)(event('POST', '/domains', { hostname: 'c.acme.com' }));
    expect(r1.statusCode).toBe(201);
    expect(r2.statusCode).toBe(201);
    expect(r3.statusCode).toBe(429);
    expect(JSON.parse(r3.body).code).toBe('ERR_RATE_LIMITED');

    if (prev === undefined) delete process.env.DOMAIN_ATTACH_RATE_LIMIT;
    else process.env.DOMAIN_ATTACH_RATE_LIMIT = prev;
    jest.resetModules();
  });
});

describe('domains handler — check', () => {
  beforeEach(() => jest.clearAllMocks());

  it('404s on unknown hostname', async () => {
    parseSessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    getDomainMock.mockResolvedValueOnce(null);
    const res = await (handler as any)(event('GET', '/domains/app.acme.com'));
    expect(res.statusCode).toBe(404);
  });

  it('attaches alias when ACM ISSUED and flips status to ACTIVE', async () => {
    parseSessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    getDomainMock.mockResolvedValueOnce({
      agencyId: 'a1',
      hostname: 'app.acme.com',
      status: 'VALIDATING',
      certArn: 'arn:1',
      trafficTarget: 'd123.cloudfront.net',
    } as any);
    describeCertMock.mockResolvedValueOnce({
      certArn: 'arn:1',
      status: 'ISSUED',
      validationRecord: undefined,
      domainValidationStatus: 'SUCCESS',
    } as any);
    attachMock.mockResolvedValueOnce(undefined);

    const res = await (handler as any)(event('GET', '/domains/app.acme.com'));
    expect(res.statusCode).toBe(200);
    expect(attachMock).toHaveBeenCalledWith({
      distributionId: 'DIST123',
      hostname: 'app.acme.com',
      certArn: 'arn:1',
    });
    expect(updateStatusMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'ACTIVE' }),
    );
  });

  it('returns VALIDATING when ACM still pending with a validation record', async () => {
    parseSessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    getDomainMock.mockResolvedValueOnce({
      agencyId: 'a1',
      hostname: 'app.acme.com',
      status: 'PENDING_DNS',
      certArn: 'arn:1',
    } as any);
    describeCertMock.mockResolvedValueOnce({
      certArn: 'arn:1',
      status: 'PENDING_VALIDATION',
      validationRecord: { name: '_x.app.acme.com', value: '_y.acm-validations.aws.', type: 'CNAME' },
    } as any);

    const res = await (handler as any)(event('GET', '/domains/app.acme.com'));
    expect(res.statusCode).toBe(200);
    expect(updateStatusMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'VALIDATING' }),
    );
    expect(attachMock).not.toHaveBeenCalled();
  });
});

describe('domains handler — remove', () => {
  beforeEach(() => jest.clearAllMocks());

  it('detaches alias, deletes cert, flips status to REMOVED', async () => {
    parseSessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    getDomainMock.mockResolvedValueOnce({
      agencyId: 'a1',
      hostname: 'app.acme.com',
      status: 'ACTIVE',
      certArn: 'arn:1',
    } as any);

    const res = await (handler as any)(event('DELETE', '/domains/app.acme.com'));
    expect(res.statusCode).toBe(200);
    expect(detachMock).toHaveBeenCalledWith({
      distributionId: 'DIST123',
      hostname: 'app.acme.com',
    });
    expect(deleteCertMock).toHaveBeenCalledWith('arn:1');
    expect(updateStatusMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'REMOVED' }),
    );
  });

  it('tolerates NoSuchAlias detach errors as already-detached', async () => {
    parseSessionMock.mockReturnValue({ agencyId: 'a1', role: 'agency' } as any);
    getDomainMock.mockResolvedValueOnce({
      agencyId: 'a1',
      hostname: 'app.acme.com',
      status: 'FAILED',
      certArn: 'arn:1',
    } as any);
    detachMock.mockRejectedValueOnce(new Error('NoSuchAlias: already removed'));

    const res = await (handler as any)(event('DELETE', '/domains/app.acme.com'));
    expect(res.statusCode).toBe(200);
    expect(updateStatusMock).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'REMOVED' }),
    );
  });
});
