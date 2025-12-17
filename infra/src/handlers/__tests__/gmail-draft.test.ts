/**
 * @jest-environment node
 */
import { handler } from '../gmail';

const ORIGIN = 'http://localhost:3000';

process.env.GOOGLE_CLIENT_ID = 'fake';
process.env.GOOGLE_CLIENT_SECRET = 'fake';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost/callback';
process.env.MOCK_GMAIL = 'true';

jest.mock('../../lib/dynamo', () => ({
  putItem: jest.fn(),
  getItem: jest.fn().mockResolvedValue({ tokens: { access_token: 't' } }),
  queryByPK: jest.fn(),
  updateItem: jest.fn(),
  deleteItem: jest.fn(),
}));

function makeEvent(method: string, action: string, body?: any, qs?: Record<string, string>) {
  return {
    requestContext: { http: { method } },
    pathParameters: { action },
    queryStringParameters: qs,
    headers: { 'x-agency-id': 'agency-001', origin: ORIGIN },
    body: body ? JSON.stringify(body) : undefined,
  } as any;
}

describe('gmail handler create-draft', () => {
  it('fails without tokens', async () => {
    const { getItem } = jest.requireMock('../../lib/dynamo');
    getItem.mockResolvedValueOnce(null);
    const res = (await handler(
      makeEvent('POST', 'create-draft', { clientId: 'c1', recipients: ['a@test.com'], subject: 's', html: '<p>x</p>' }),
    )) as any;
    expect(res.statusCode).toBe(400);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });

  it('returns ok with recipient count', async () => {
    const res = (await handler(
      makeEvent('POST', 'create-draft', { clientId: 'c1', recipients: ['a@test.com', 'b@test.com'], subject: 's', html: '<p>x</p>' }),
    )) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
    const body = JSON.parse(res.body || '{}');
    expect(body.created).toBe(2);
  });

  it('handles OPTIONS', async () => {
    const res = (await handler(makeEvent('OPTIONS', 'create-draft'))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });
});

