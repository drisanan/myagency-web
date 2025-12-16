/**
 * @jest-environment node
 */
import { handler } from '../gmail';

// Provide fake Google config for tests
process.env.GOOGLE_CLIENT_ID = 'fake';
process.env.GOOGLE_CLIENT_SECRET = 'fake';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost/callback';

function makeEvent(method: string, action: string, qs?: Record<string, string>) {
  return {
    requestContext: { http: { method } },
    pathParameters: { action },
    queryStringParameters: qs,
    headers: {},
  } as any;
}

describe('gmail handler', () => {
  it('returns oauth url', async () => {
    const res = (await handler(makeEvent('POST', 'oauth-url'))) as any;
    expect(res.statusCode).toBe(200);
    const body = JSON.parse(res.body || '{}');
    expect(body.url).toBeDefined();
  });

  it('fails without code on callback', async () => {
    const res = (await handler(makeEvent('POST', 'oauth-callback'))) as any;
    expect(res.statusCode).toBe(400);
  });
});

