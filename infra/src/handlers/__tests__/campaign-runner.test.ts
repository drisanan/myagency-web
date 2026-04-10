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
    listAgencyIds: jest.fn(),
    queryByPK: jest.fn(),
  };
});

jest.mock('../../lib/gmailSend', () => ({
  sendGmailMessage: jest.fn(),
}));

jest.mock('../../lib/emailMetrics', () => ({
  recordEmailSendsInternal: jest.fn(),
}));

const { listAgencyIds, queryByPK, getItem, putItem } = jest.requireMock('../../lib/dynamo');
const { sendGmailMessage } = jest.requireMock('../../lib/gmailSend');

function makeHttpEvent(method: string) {
  return {
    requestContext: { http: { method } },
    headers: { origin: 'http://localhost:3000' },
  } as any;
}

function makeScheduledEvent() {
  return {
    source: 'aws.events',
    'detail-type': 'Scheduled Event',
    detail: {},
  } as any;
}

function makeCampaign(overrides: Record<string, any> = {}) {
  return {
    PK: 'AGENCY#agency-001',
    SK: 'CAMPAIGN#camp-1',
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
    ...overrides,
  };
}

describe('campaign-runner handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listAgencyIds.mockResolvedValue(['agency-001']);
  });

  it('sends due campaigns via HTTP trigger', async () => {
    const campaign = makeCampaign();
    queryByPK.mockResolvedValue([campaign]);
    getItem.mockImplementation(({ SK }: { SK: string }) => {
      if (SK === 'CAMPAIGN#camp-1') return campaign;
      if (SK.startsWith('CLIENT#')) return { email: 'athlete@test.com' };
      if (SK.startsWith('CAMPAIGN_FOLLOWUP#')) return undefined;
      return undefined;
    });

    const res = (await handler(makeHttpEvent('POST'))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(res.statusCode).toBe(200);
    expect(body.results[0].status).toBe('sent');
    expect(sendGmailMessage).toHaveBeenCalled();
  });

  it('sends due campaigns via EventBridge trigger', async () => {
    const campaign = makeCampaign();
    queryByPK.mockResolvedValue([campaign]);
    getItem.mockImplementation(({ SK }: { SK: string }) => {
      if (SK === 'CAMPAIGN#camp-1') return campaign;
      if (SK.startsWith('CLIENT#')) return { email: 'athlete@test.com' };
      if (SK.startsWith('CAMPAIGN_FOLLOWUP#')) return undefined;
      return undefined;
    });

    const res = (await handler(makeScheduledEvent())) as any;
    const body = JSON.parse(res.body || '{}');
    expect(body.ok).toBe(true);
    expect(body.results[0].status).toBe('sent');
    expect(sendGmailMessage).toHaveBeenCalled();
  });

  it('skips campaigns cancelled between scan and send', async () => {
    const campaign = makeCampaign();
    queryByPK.mockResolvedValue([campaign]);
    getItem.mockImplementation(({ SK }: { SK: string }) => {
      if (SK === 'CAMPAIGN#camp-1') return { ...campaign, status: 'cancelled' };
      return undefined;
    });

    const res = (await handler(makeHttpEvent('POST'))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(res.statusCode).toBe(200);
    expect(body.results[0].status).toBe('skipped');
    expect(sendGmailMessage).not.toHaveBeenCalled();
  });

  it('skips campaigns that no longer exist', async () => {
    const campaign = makeCampaign();
    queryByPK.mockResolvedValue([campaign]);
    getItem.mockResolvedValue(undefined);

    const res = (await handler(makeHttpEvent('POST'))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(body.results[0].status).toBe('skipped');
    expect(sendGmailMessage).not.toHaveBeenCalled();
  });

  it('skips campaigns already sent', async () => {
    const campaign = makeCampaign();
    queryByPK.mockResolvedValue([campaign]);
    getItem.mockImplementation(({ SK }: { SK: string }) => {
      if (SK === 'CAMPAIGN#camp-1') return { ...campaign, status: 'sent', sentAt: Date.now() };
      return undefined;
    });

    const res = (await handler(makeHttpEvent('POST'))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(body.results[0].status).toBe('skipped');
    expect(sendGmailMessage).not.toHaveBeenCalled();
  });

  it('does nothing when no campaigns are due', async () => {
    queryByPK.mockResolvedValue([]);
    const res = (await handler(makeHttpEvent('GET'))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(body.results).toEqual([]);
    expect(sendGmailMessage).not.toHaveBeenCalled();
  });
});
