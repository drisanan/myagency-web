/**
 * @jest-environment node
 */
import { handler } from '../gmail';

const ORIGIN = 'http://localhost:3000';

// Provide fake Google config for tests
process.env.GOOGLE_CLIENT_ID = 'fake';
process.env.GOOGLE_CLIENT_SECRET = 'fake';
process.env.GOOGLE_REDIRECT_URI = 'http://localhost/callback';

function makeEvent(method: string, action: string, qs?: Record<string, string>) {
  return {
    requestContext: { http: { method } },
    pathParameters: { action },
    queryStringParameters: qs,
    headers: { origin: ORIGIN },
  } as any;
}

describe('gmail handler', () => {
  it('returns oauth url', async () => {
    const res = (await handler(makeEvent('POST', 'oauth-url'))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
    const body = JSON.parse(res.body || '{}');
    expect(body.url).toBeDefined();
  });

  it('fails without code on callback', async () => {
    const res = (await handler(makeEvent('POST', 'oauth-callback'))) as any;
    expect(res.statusCode).toBe(400);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });

  it('handles OPTIONS', async () => {
    const res = (await handler(makeEvent('OPTIONS', 'oauth-url'))) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe(ORIGIN);
  });
});

