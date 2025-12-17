/**
 * @jest-environment node
 */
import { handler } from '../lists';

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
const ORIGIN = 'http://localhost:3000';

function makeEvent(method: string, body?: any, params?: Record<string, string>) {
  return {
    requestContext: { http: { method } },
    body: body ? JSON.stringify(body) : undefined,
    pathParameters: params,
    headers: { origin: ORIGIN },
  } as any;
}

describe('lists handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('lists lists for agency', async () => {
    queryByPK.mockResolvedValue([{ id: 'l1' }]);
    const res = (await handler(makeEvent('GET'))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
    const body = JSON.parse(res.body || '{}');
    expect(body.lists).toHaveLength(1);
    expect(queryByPK).toHaveBeenCalledWith('AGENCY#agency-001', 'LIST#');
  });

  it('creates a list', async () => {
    putItem.mockResolvedValue({});
    const payload = { name: 'My List', items: [] };
    const res = (await handler(makeEvent('POST', payload))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
    const body = JSON.parse(res.body || '{}');
    expect(body.list.name).toBe('My List');
  });

  it('gets a list by id', async () => {
    getItem.mockResolvedValue({ id: 'l123', name: 'List' });
    const res = (await handler(makeEvent('GET', undefined, { id: 'l123' }))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
    const body = JSON.parse(res.body || '{}');
    expect(body.list.id).toBe('l123');
  });

  it('handles OPTIONS', async () => {
    const res = (await handler(makeEvent('OPTIONS'))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });
});

