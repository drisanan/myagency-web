// Client authz test removed to avoid duplication; focus on handler behavior with mocks

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

  it('returns 401 when no session (mocked requireSession)', async () => {
    const { requireSession } = jest.requireMock('../common');
    requireSession.mockReturnValueOnce(null);
    const res = (await handler(makeEvent('GET'))) as any;
    expect(res.statusCode).toBe(401);
  });

  it('rejects client role if they try to include coaches', async () => {
    const { requireSession } = jest.requireMock('../common');
    requireSession.mockReturnValueOnce({ agencyId: 'agency-001', role: 'client', clientId: 'c1' });
    putItem.mockResolvedValue({});
    const payload = { name: 'My List', items: [{ email: 'coach@example.com', school: 'X', division: 'D1', state: 'CA' }] };
    const res = (await handler(makeEvent('POST', payload))) as any;
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body || '{}');
    expect(body.list.type).toBe('CLIENT_INTEREST');
    expect(body.list.clientId).toBe('c1');
    // Items should have filtered out coach-only entries (university/school required)
    expect(body.list.items.length).toBe(0);
  });
});

