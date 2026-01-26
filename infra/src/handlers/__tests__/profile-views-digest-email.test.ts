/**
 * @jest-environment node
 */
import { handler } from '../profile-views-digest-email';

jest.mock('../../lib/dynamo', () => {
  return {
    scanBySKPrefix: jest.fn(),
    queryByPK: jest.fn(),
    getItem: jest.fn(),
  };
});

jest.mock('../../lib/gmailSend', () => {
  return {
    sendGmailMessage: jest.fn(),
  };
});

jest.mock('../../lib/activity', () => {
  return {
    logActivity: jest.fn(),
  };
});

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: Function) => fn,
}));

const { scanBySKPrefix } = jest.requireMock('../../lib/dynamo');

describe('profile-views-digest-email handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('handles empty schedule run', async () => {
    scanBySKPrefix.mockResolvedValue([]);
    const res = (await handler({}) as any);
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body || '{}');
    expect(body.ok).toBe(true);
  });
});
