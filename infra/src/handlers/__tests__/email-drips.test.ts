/**
 * @jest-environment node
 */
import { handler } from '../email-drips';

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

const { putItem, queryByPK } = jest.requireMock('../../lib/dynamo');

function makeEvent(method: string, body?: any, params?: Record<string, string>) {
  return {
    requestContext: { http: { method } },
    body: body ? JSON.stringify(body) : undefined,
    pathParameters: params,
    headers: { origin: ORIGIN },
  } as any;
}

describe('email-drips handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a drip', async () => {
    putItem.mockResolvedValue({});
    const res = (await handler(makeEvent('POST', {
      name: 'Onboarding',
      steps: [{ id: 's1', dayOffset: 0, subject: 'Hi', body: 'Welcome' }],
    }))) as any;
    expect(res.statusCode).toBe(200);
  });

  it('lists drips', async () => {
    queryByPK.mockResolvedValue([{ id: 'd1' }]);
    const res = (await handler(makeEvent('GET'))) as any;
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body || '{}');
    expect(body.drips).toHaveLength(1);
  });
});
