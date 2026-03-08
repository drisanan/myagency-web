/**
 * @jest-environment node
 */
import { handler } from '../forms-public';

jest.mock('../../lib/formsToken', () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn((token: string) => (token === 'valid' ? { agencyEmail: 'a@test.com', agencyId: 'agency-001', type: 'intake' } : null)),
}));

jest.mock('../common', () => ({
  requireAgencySession: jest.fn(() => ({ agencyId: 'agency-001', agencyEmail: 'a@test.com', role: 'agency' })),
}));

jest.mock('../../lib/dynamo', () => ({
  getItem: jest.fn(),
  putItem: jest.fn(),
  deleteItem: jest.fn(),
  queryByPK: jest.fn(),
  queryGSI1: jest.fn(),
  queryGSI3: jest.fn(),
}));

const { queryGSI1, queryGSI3, queryByPK, getItem, putItem } = jest.requireMock('../../lib/dynamo');
const ORIGIN = 'http://localhost:3000';

function makeEvent(method: string, path: string, body?: any, qs?: Record<string, string>) {
  return {
    requestContext: { http: { method, path } },
    body: body ? JSON.stringify(body) : undefined,
    queryStringParameters: qs,
    headers: { origin: ORIGIN, host: 'localhost:3000', 'x-forwarded-proto': 'http' },
  } as any;
}

describe('forms-public handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles OPTIONS', async () => {
    const res = (await handler(makeEvent('OPTIONS', '/forms/issue'))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });

  it('issues a token', async () => {
    const res = (await handler(makeEvent('POST', '/forms/issue'))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
    const body = JSON.parse(res.body || '{}');
    expect(body.token).toBe('signed-token');
  });

  it('rejects invalid agency token on /forms/agency', async () => {
    const res = (await handler(makeEvent('GET', '/forms/agency', undefined, { token: 'bad' }))) as any;
    expect(res.statusCode).toBe(400);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });

  it('gets agency for valid token', async () => {
    queryGSI1.mockResolvedValueOnce([{ name: 'Agency', email: 'a@test.com', settings: {} }]);
    const res = (await handler(makeEvent('GET', '/forms/agency', undefined, { token: 'valid' }))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
    const body = JSON.parse(res.body || '{}');
    expect(body.agency.email).toBe('a@test.com');
  });

  it('rejects invalid token on submit', async () => {
    const res = (await handler(makeEvent('POST', '/forms/submit', { token: 'bad', form: {} }))) as any;
    expect(res.statusCode).toBe(400);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });

  it('submits form with valid token', async () => {
    queryGSI1
      .mockResolvedValueOnce([{ id: 'agency-001', name: 'Agency', email: 'a@test.com', settings: {} }])
      .mockResolvedValueOnce([]);
    queryGSI3.mockResolvedValueOnce([]);
    putItem.mockResolvedValue({});
    const res = (await handler(makeEvent('POST', '/forms/submit', {
      token: 'valid',
      form: {
        email: 'x@test.com',
        firstName: 'Ava',
        lastName: 'Smith',
        sport: 'Football',
        profileImageUrl: 'https://example.com/profile.jpg',
        highlightVideos: [{ url: 'https://example.com/video' }],
      },
    }))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
    expect(putItem).toHaveBeenCalledWith(expect.objectContaining({
      email: 'x@test.com',
      firstName: 'Ava',
      profileImageUrl: 'https://example.com/profile.jpg',
      highlightVideos: [{ url: 'https://example.com/video' }],
      accountStatus: 'pending',
    }));
  });

  it('lists submissions requires session', async () => {
    const { requireAgencySession } = jest.requireMock('../common');
    requireAgencySession.mockReturnValueOnce(null);
    const res = (await handler(makeEvent('GET', '/forms/submissions', undefined, {}))) as any;
    expect(res.statusCode).toBe(401);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });

  it('lists submissions returns items', async () => {
    queryByPK.mockResolvedValueOnce([{ consumed: false }, { consumed: true }]);
    const res = (await handler(makeEvent('GET', '/forms/submissions', undefined, {}))) as any;
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body || '{}');
    expect(body.items).toHaveLength(1);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });

  it('consume requires session', async () => {
    const { requireAgencySession } = jest.requireMock('../common');
    requireAgencySession.mockReturnValueOnce(null);
    const res = (await handler(makeEvent('POST', '/forms/consume', { ids: ['f1'] }))) as any;
    expect(res.statusCode).toBe(401);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });

  it('consume marks items', async () => {
    getItem.mockResolvedValue({ id: 'f1' });
    putItem.mockResolvedValue({});
    const res = (await handler(makeEvent('POST', '/forms/consume', { ids: ['f1'] }))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });
});

