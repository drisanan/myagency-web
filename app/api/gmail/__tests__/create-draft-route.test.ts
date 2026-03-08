/**
 * @jest-environment node
 */

import { NextRequest } from 'next/server';
import { POST } from '../create-draft/route';

jest.mock('@/config/env', () => ({
  getServerApiBaseUrl: () => 'https://api.example.test',
}));

describe('create-draft route', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
    jest.clearAllMocks();
  });

  test('proxies request body to backend create-draft endpoint', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(JSON.stringify({ ok: true, created: 2, openUrl: 'https://mail.google.com' }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    ) as any;

    const req = new NextRequest('http://localhost/api/gmail/create-draft', {
      method: 'POST',
      body: JSON.stringify({ clientId: 'c1', to: ['coach@example.com'], subject: 'Hello', html: '<p>x</p>' }),
      headers: { 'content-type': 'application/json', cookie: 'an_session=test' },
    });

    const res = await POST(req);
    const body = await res.json();

    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.test/gmail/create-draft',
      expect.objectContaining({
        method: 'POST',
      }),
    );
  });
});
