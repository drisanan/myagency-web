/**
 * @jest-environment node
 */
import { handler } from '../list-assignments';

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: any) => fn,
}));

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
    deleteItem: jest.fn(),
    queryByPK: jest.fn(),
    queryGSI3: jest.fn(),
  };
});

const { getItem, putItem, deleteItem, queryGSI3 } = jest.requireMock('../../lib/dynamo');
const ORIGIN = 'http://localhost:3000';

function makeEvent(method: string, query?: Record<string, string>, body?: any) {
  return {
    requestContext: { http: { method } },
    queryStringParameters: query,
    body: body ? JSON.stringify(body) : undefined,
    headers: { origin: ORIGIN },
  } as any;
}

describe('list-assignments handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('assigns a list to a client', async () => {
    getItem.mockResolvedValue({ id: 'list-1', type: 'AGENCY_LIST' });
    const res = (await handler(makeEvent('POST', undefined, { clientId: 'client-1', listId: 'list-1' }))) as any;
    expect(res.statusCode).toBe(200);
    expect(putItem).toHaveBeenCalled();
  });

  it('lists assignments with lists included', async () => {
    queryGSI3.mockResolvedValue([{ listId: 'list-1', clientId: 'client-1' }]);
    getItem.mockResolvedValue({ id: 'list-1', name: 'My List' });
    const res = (await handler(makeEvent('GET', { clientId: 'client-1', includeLists: 'true' }))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(body.assignments).toHaveLength(1);
    expect(body.lists).toHaveLength(1);
  });

  it('deletes an assignment', async () => {
    const res = (await handler(makeEvent('DELETE', { clientId: 'client-1', listId: 'list-1' }))) as any;
    expect(res.statusCode).toBe(200);
    expect(deleteItem).toHaveBeenCalledWith({ PK: 'AGENCY#agency-001', SK: 'LIST_ASSIGN#list-1#client-1' });
  });
});
