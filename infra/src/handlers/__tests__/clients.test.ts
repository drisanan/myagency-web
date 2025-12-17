/**
 * @jest-environment node
 */
import { handler } from '../clients';

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
    getItem: jest.fn(),
    putItem: jest.fn(),
    queryByPK: jest.fn(),
  };
});

const { queryByPK, putItem, getItem } = jest.requireMock('../../lib/dynamo');

function makeEvent(method: string, body?: any, params?: Record<string, string>) {
  return {
    requestContext: { http: { method } },
    body: body ? JSON.stringify(body) : undefined,
    pathParameters: params,
    headers: { origin: ORIGIN },
  } as any;
}

describe('clients handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists clients for agency', async () => {
    queryByPK.mockResolvedValue([{ id: 'c1' }, { id: 'c2' }]);
    const res = (await handler(makeEvent('GET'))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
    const body = JSON.parse(res.body || '{}');
    expect(body.clients).toHaveLength(2);
    expect(queryByPK).toHaveBeenCalledWith('AGENCY#agency-001', 'CLIENT#');
  });

  it('creates a client for agency', async () => {
    putItem.mockResolvedValue({});
    const payload = { email: 'x@test.com', firstName: 'X', lastName: 'Y', sport: 'Football' };
    const res = (await handler(makeEvent('POST', payload))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
    const body = JSON.parse(res.body || '{}');
    expect(body.client.email).toBe('x@test.com');
    expect(putItem).toHaveBeenCalled();
  });

  it('gets a client by id', async () => {
    getItem.mockResolvedValue({ id: 'c123', email: 'e@test.com' });
    const res = (await handler(makeEvent('GET', undefined, { id: 'c123' }))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
    const body = JSON.parse(res.body || '{}');
    expect(body.client.id).toBe('c123');
    expect(getItem).toHaveBeenCalledWith({ PK: 'AGENCY#agency-001', SK: 'CLIENT#c123' });
  });

  it('handles OPTIONS', async () => {
    const res = (await handler(makeEvent('OPTIONS'))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });
});

