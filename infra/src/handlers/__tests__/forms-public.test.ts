/**
 * @jest-environment node
 */
import { handler } from '../forms-public';

jest.mock('../../lib/formsToken', () => ({
  sign: jest.fn(() => 'signed-token'),
  verify: jest.fn((token: string) => (token === 'valid' ? { agencyEmail: 'a@test.com' } : null)),
}));

jest.mock('../../lib/dynamo', () => ({
  getItem: jest.fn(),
  putItem: jest.fn(),
  queryByPK: jest.fn(),
  queryGSI1: jest.fn(),
}));

const { queryGSI1, queryByPK, getItem, putItem } = jest.requireMock('../../lib/dynamo');
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
    const res = (await handler(makeEvent('POST', '/forms/issue', { agencyEmail: 'a@test.com' }))) as any;
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
    putItem.mockResolvedValue({});
    const res = (await handler(makeEvent('POST', '/forms/submit', { token: 'valid', form: { email: 'x@test.com' } }))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });

  it('lists submissions requires agencyEmail', async () => {
    const res = (await handler(makeEvent('GET', '/forms/submissions', undefined, {}))) as any;
    expect(res.statusCode).toBe(400);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });

  it('lists submissions returns items', async () => {
    queryByPK.mockResolvedValueOnce([{ consumed: false }, { consumed: true }]);
    const res = (await handler(makeEvent('GET', '/forms/submissions', undefined, { agencyEmail: 'a@test.com' }))) as any;
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body || '{}');
    expect(body.items).toHaveLength(1);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });

  it('consume requires params', async () => {
    const res = (await handler(makeEvent('POST', '/forms/consume', { foo: 'bar' }))) as any;
    expect(res.statusCode).toBe(400);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });

  it('consume marks items', async () => {
    getItem.mockResolvedValue({ id: 'f1' });
    putItem.mockResolvedValue({});
    const res = (await handler(makeEvent('POST', '/forms/consume', { agencyEmail: 'a@test.com', ids: ['f1'] }))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });
});

