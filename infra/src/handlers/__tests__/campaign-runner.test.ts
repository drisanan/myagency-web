/**
 * @jest-environment node
 */
import { handler } from '../campaign-runner';

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: any) => fn,
}));

jest.mock('../../lib/dynamo', () => {
  return {
    getItem: jest.fn(),
    putItem: jest.fn(),
    scanBySKPrefix: jest.fn(),
  };
});

jest.mock('../../lib/gmailSend', () => ({
  sendGmailMessage: jest.fn(),
}));

jest.mock('../../lib/emailMetrics', () => ({
  recordEmailSendsInternal: jest.fn(),
}));

const { scanBySKPrefix, getItem } = jest.requireMock('../../lib/dynamo');
const { sendGmailMessage } = jest.requireMock('../../lib/gmailSend');

function makeEvent(method: string) {
  return {
    requestContext: { http: { method } },
    headers: { origin: 'http://localhost:3000' },
  } as any;
}

describe('campaign-runner handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('sends due campaigns', async () => {
    scanBySKPrefix.mockResolvedValue([{
      id: 'camp-1',
      agencyId: 'agency-001',
      clientId: 'client-1',
      subject: 'Test',
      html: '<p>Hello Coach</p>',
      recipients: [{ email: 'coach@test.com', name: 'Coach A' }],
      senderClientId: 'client-1',
      status: 'scheduled',
      scheduledAt: Date.now() - 1000,
      createdAt: Date.now() - 2000,
      updatedAt: Date.now() - 2000,
    }]);
    getItem.mockResolvedValue({ email: 'athlete@test.com' });

    const res = (await handler(makeEvent('POST'))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(res.statusCode).toBe(200);
    expect(body.results[0].status).toBe('sent');
    expect(sendGmailMessage).toHaveBeenCalled();
  });
});
