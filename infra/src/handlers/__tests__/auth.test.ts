/**
 * @jest-environment node
 */
import { handler } from '../auth';

function makeEvent(method: string, body?: any, cookies?: string) {
  return {
    requestContext: { http: { method } },
    body: body ? JSON.stringify(body) : undefined,
    headers: cookies ? { cookie: cookies } : {},
  } as any;
}

describe('auth handler', () => {
  it('creates a session and sets cookie', async () => {
    const res = (await handler(
      makeEvent('POST', { agencyId: 'agency-001', email: 'agency1@an.test', role: 'agency', userId: 'u1' }),
    )) as any;
    expect(res.statusCode).toBe(200);
    expect(res.headers['set-cookie']).toContain('an_session=');
  });

  it('returns session on GET', async () => {
    const post = (await handler(
      makeEvent('POST', { agencyId: 'agency-001', email: 'agency1@an.test', role: 'agency', userId: 'u1' }),
    )) as any;
    const cookie = post.headers['set-cookie'];
    const res = (await handler(makeEvent('GET', undefined, cookie))) as any;
    const body = JSON.parse(res.body || '{}');
    expect(body.session?.agencyId).toBe('agency-001');
  });

  it('clears cookie on DELETE', async () => {
    const res = (await handler(makeEvent('DELETE'))) as any;
    expect(res.headers['set-cookie']).toContain('Max-Age=0');
  });
});

