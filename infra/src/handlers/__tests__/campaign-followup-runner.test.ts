/**
 * @jest-environment node
 */
import { handler } from '../campaign-followup-runner';

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: any) => fn,
}));

jest.mock('../../lib/dynamo', () => {
  return {
    getItem: jest.fn(),
    putItem: jest.fn(),
    listAgencyIds: jest.fn(),
    queryByPK: jest.fn(),
    queryGSI3: jest.fn(),
  };
});

jest.mock('../../lib/gmailSend', () => ({
  sendGmailMessage: jest.fn(),
}));

jest.mock('../../lib/emailMetrics', () => ({
  listCampaignEmailStats: jest.fn(),
}));

jest.mock('../../lib/activity', () => ({
  logActivity: jest.fn(),
}));

const { listAgencyIds, queryByPK, getItem, putItem, queryGSI3 } = jest.requireMock('../../lib/dynamo');
const { listCampaignEmailStats } = jest.requireMock('../../lib/emailMetrics');
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

describe('campaign-followup-runner handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    listAgencyIds.mockResolvedValue(['agency-001']);
  });

  it('sends due followups', async () => {
    queryByPK.mockResolvedValue([{
      id: 'follow-1',
      agencyId: 'agency-001',
      clientId: 'client-1',
      SK: 'CAMPAIGN_FOLLOWUP#camp-1',
      scheduledFor: Date.now() - 1000,
      status: 'pending',
      createdAt: Date.now() - 2000,
    }]);
    getItem.mockImplementation(({ SK }: { SK: string }) => {
      if (SK.startsWith('CAMPAIGN#')) {
        return { id: 'camp-1', agencyId: 'agency-001', clientId: 'client-1', sentAt: Date.now() - 10000, status: 'sent', senderClientId: 'client-1', agentEmail: 'agent@test.com' };
      }
      if (SK.startsWith('CLIENT#')) {
        return { id: 'client-1', email: 'athlete@test.com', firstName: 'Test', lastName: 'Athlete' };
      }
      return null;
    });
    listCampaignEmailStats.mockResolvedValue({ sentCount: 2, openCount: 1, clickCount: 1 });
    queryGSI3.mockResolvedValue([]);

    const res = (await handler(makeHttpEvent('POST'))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(res.statusCode).toBe(200);
    expect(body.results[0].status).toBe('sent');
    expect(sendGmailMessage).toHaveBeenCalled();
  });

  it('skips followups for cancelled campaigns', async () => {
    queryByPK.mockResolvedValue([{
      id: 'follow-2',
      agencyId: 'agency-001',
      clientId: 'client-1',
      SK: 'CAMPAIGN_FOLLOWUP#camp-2',
      scheduledFor: Date.now() - 1000,
      status: 'pending',
      createdAt: Date.now() - 2000,
    }]);
    getItem.mockImplementation(({ SK }: { SK: string }) => {
      if (SK.startsWith('CAMPAIGN#')) {
        return { id: 'camp-2', agencyId: 'agency-001', clientId: 'client-1', sentAt: Date.now() - 10000, status: 'cancelled', senderClientId: 'client-1' };
      }
      return null;
    });

    const res = (await handler(makeHttpEvent('POST'))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(body.results[0].status).toBe('failed');
    expect(body.results[0].error).toContain('cancelled');
    expect(sendGmailMessage).not.toHaveBeenCalled();
    expect(putItem).toHaveBeenCalledWith(expect.objectContaining({ status: 'failed' }));
  });

  it('handles EventBridge trigger', async () => {
    queryByPK.mockResolvedValue([]);
    const res = (await handler(makeScheduledEvent())) as any;
    const body = JSON.parse(res.body || '{}');
    expect(body.ok).toBe(true);
    expect(body.results).toEqual([]);
  });
});
