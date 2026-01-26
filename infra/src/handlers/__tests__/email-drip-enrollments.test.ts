/**
 * @jest-environment node
 */
import { handler } from '../email-drip-enrollments';

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
    putItem: jest.fn(),
    queryByPK: jest.fn(),
    getItem: jest.fn(),
    deleteItem: jest.fn(),
  };
});

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: Function) => fn,
}));

const { putItem, getItem, queryByPK } = jest.requireMock('../../lib/dynamo');

function makeEvent(method: string, body?: any) {
  return {
    requestContext: { http: { method } },
    body: body ? JSON.stringify(body) : undefined,
    headers: { origin: ORIGIN },
  } as any;
}

describe('email-drip-enrollments handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('enrolls a client', async () => {
    getItem.mockResolvedValue({ id: 'drip-1', isActive: true, steps: [{ id: 's1', dayOffset: 0, subject: 'Hi', body: 'Welcome' }] });
    putItem.mockResolvedValue({});
    const res = (await handler(makeEvent('POST', { dripId: 'drip-1', clientId: 'client-1' }))) as any;
    expect(res.statusCode).toBe(200);
  });

  it('lists enrollments', async () => {
    queryByPK.mockResolvedValue([{ dripId: 'drip-1', clientId: 'client-1' }]);
    const res = (await handler(makeEvent('GET'))) as any;
    expect(res.statusCode).toBe(200);
  });
});
