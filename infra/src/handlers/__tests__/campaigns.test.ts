/**
 * @jest-environment node
 */
import { handler } from '../campaigns';

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: any) => fn,
}));

jest.mock('../common', () => {
  const original = jest.requireActual('../common');
  return {
    ...original,
    requireSession: jest.fn(() => ({
      agencyId: 'agency-001',
      agencyEmail: 'agency1@an.test',
      role: 'agency',
      firstName: 'Test',
      lastName: 'User',
    })),
  };
});

jest.mock('../../lib/dynamo', () => {
  return {
    getItem: jest.fn(),
    putItem: jest.fn(),
    queryByPK: jest.fn(),
    queryGSI3: jest.fn(),
  };
});

const { putItem, queryByPK } = jest.requireMock('../../lib/dynamo');
const ORIGIN = 'http://localhost:3000';

function makeEvent(method: string, body?: any, query?: Record<string, string>) {
  return {
    requestContext: { http: { method } },
    queryStringParameters: query,
    body: body ? JSON.stringify(body) : undefined,
    headers: { origin: ORIGIN },
  } as any;
}

describe('campaigns handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('creates a scheduled campaign', async () => {
    const res = (await handler(makeEvent('POST', {
      clientId: 'client-1',
      subject: 'Test',
      html: '<p>Hi</p>',
      recipients: [{ email: 'coach@test.com' }],
      senderClientId: 'client-1',
      scheduledAt: Date.now() + 3600_000,
    }))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(res.statusCode).toBe(200);
    expect(body.campaign.status).toBe('scheduled');
    expect(putItem).toHaveBeenCalled();
  });

  it('lists campaigns', async () => {
    queryByPK.mockResolvedValue([{ id: 'c1' }]);
    const res = (await handler(makeEvent('GET'))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(res.statusCode).toBe(200);
    expect(body.campaigns).toHaveLength(1);
  });
});
