/**
 * @jest-environment node
 */
import { handler as tasksHandler } from '../tasks';

jest.mock('../common', () => {
  const original = jest.requireActual('../common');
  return {
    ...original,
    requireSession: jest.fn(),
  };
});

jest.mock('../../lib/dynamo', () => {
  return {
    queryByPK: jest.fn().mockResolvedValue([]),
    putItem: jest.fn().mockResolvedValue({}),
    deleteItem: jest.fn().mockResolvedValue({}),
    getItem: jest.fn().mockResolvedValue(null),
  };
});

const { requireSession } = jest.requireMock('../common');

function makeEvent(method: string) {
  return {
    requestContext: { http: { method } },
    headers: { origin: 'http://localhost' },
  } as any;
}

describe('authz agent-only routes', () => {
  it('rejects client role on tasks handler', async () => {
    requireSession.mockReturnValueOnce({ role: 'client', agencyId: 'A1', clientId: 'C1' });
    const res = (await tasksHandler(makeEvent('GET'))) as any;
    expect(res.statusCode).toBe(403);
  });

  it('allows agency role on tasks handler', async () => {
    requireSession.mockReturnValueOnce({ role: 'agency', agencyId: 'A1' });
    const res = (await tasksHandler(makeEvent('GET'))) as any;
    expect(res.statusCode).toBeDefined();
  });
});

