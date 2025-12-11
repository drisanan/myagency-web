// Mock next/server to avoid constructing real Next Request/Response types
jest.mock('next/server', () => {
  return {
    NextResponse: {
      json: (body: any, init?: any) => ({
        json: async () => body,
        status: init?.status ?? 200,
      }),
    },
  };
});

import { POST } from '../create-draft/route';

function makeReq(body: any) {
  return {
    json: async () => body,
  } as any;
}

describe('create-draft route - recipients and tokens', () => {
  test('returns 400 when no valid recipient emails', async () => {
    const res: any = await POST(makeReq({ clientId: 'c1', to: ['not-an-email'], subject: 'S', html: '<p>x</p>' }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.error).toMatch(/No valid recipient emails/i);
  });

  test('parses Name <email@domain> and returns 401 when tokens missing', async () => {
    const res: any = await POST(makeReq({ clientId: 'c1', to: ['John Doe <coach@ex.com>'], subject: 'S', html: '<p>x</p>' }));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toMatch(/Gmail not connected/i);
  });

  test('parses mailto: links and returns 401 when tokens missing', async () => {
    const res: any = await POST(makeReq({ clientId: 'c1', to: ['mailto:coach@ex.com?subject=Hi'], subject: 'S', html: '<p>x</p>' }));
    const json = await res.json();
    expect(res.status).toBe(401);
    expect(json.error).toMatch(/Gmail not connected/i);
  });
});


