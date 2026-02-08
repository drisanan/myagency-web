/**
 * @jest-environment node
 */
import { handler } from '../profile-public';

const ORIGIN = 'http://localhost:3000';

jest.mock('../../lib/dynamo', () => {
  return {
    queryGSI3: jest.fn(),
  };
});

jest.mock('../../lib/sentry', () => ({
  withSentry: (fn: Function) => fn,
}));

const { queryGSI3 } = jest.requireMock('../../lib/dynamo');

function makeEvent(username: string) {
  return {
    requestContext: { http: { method: 'GET' } },
    rawPath: `/athlete/${username}`,
    pathParameters: { username },
    headers: { origin: ORIGIN },
  } as any;
}

describe('profile-public handler', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('returns 404 for paused accounts', async () => {
    queryGSI3.mockResolvedValue([
      { id: 'c1', username: 'jane', firstName: 'Jane', lastName: 'Doe', accountStatus: 'paused' },
    ]);
    const res = (await handler(makeEvent('jane'))) as any;
    expect(res.statusCode).toBe(404);
    const body = JSON.parse(res.body || '{}');
    expect(body.error).toBe('Profile not found');
  });

  it('returns profile for active accounts', async () => {
    queryGSI3.mockResolvedValue([
      { id: 'c1', username: 'jane', firstName: 'Jane', lastName: 'Doe', sport: 'Soccer' },
    ]);
    const res = (await handler(makeEvent('jane'))) as any;
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body || '{}');
    expect(body.profile.username).toBe('jane');
  });
});
