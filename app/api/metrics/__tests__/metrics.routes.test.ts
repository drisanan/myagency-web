/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET as openHandler } from '../open/route';
import { GET as clickHandler } from '../click/route';
import { POST as seedHandler } from '../seed/route';
import { getStats, todayISO } from '../store';

const agencyEmail = 'agency-metrics@test.dev';

describe('metrics routes', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    process.env.API_BASE_URL = 'https://api.example.test';
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  test('open pixel records opens', async () => {
    global.fetch = jest.fn().mockResolvedValue(
      new Response(Buffer.from('gif'), {
        status: 200,
        headers: { 'Content-Type': 'image/gif' },
      }),
    ) as any;
    const req = new NextRequest(`http://localhost/api/metrics/open?tid=abc&agency=${agencyEmail}`);
    const res = await openHandler(req);
    expect(res.status).toBe(200);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining('https://api.example.test/email-metrics/open?tid=abc&agency=agency-metrics%40test.dev'),
      expect.objectContaining({ cache: 'no-store' }),
    );
  });

  test('click redirect records clicks and respects url', async () => {
    const target = 'https://example.com/page';
    const req = new NextRequest(
      `http://localhost/api/metrics/click?tid=def&agency=${agencyEmail}&u=${encodeURIComponent(target)}`,
    );
    const res = await clickHandler(req);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toContain('https://api.example.test/r?');
    expect(res.headers.get('location')).toContain(`d=${encodeURIComponent(target)}`);
  });

  test('seed route populates sends/opens/clicks', async () => {
    const today = todayISO();
    const body = {
      agencyEmail,
      days: [{ date: today, sends: 5, opens: 3, clicks: 2 }],
    };
    const req = new NextRequest('http://localhost/api/metrics/seed', {
      method: 'POST',
      body: JSON.stringify(body),
    });
    const res = await seedHandler(req);
    const json = await res.json();
    expect(json.ok).toBe(true);

    const stats = getStats(agencyEmail, 1);
    expect(stats.totals.sends).toBeGreaterThanOrEqual(5);
    expect(stats.totals.opens).toBeGreaterThanOrEqual(3);
    expect(stats.days[0].clicks).toBeGreaterThanOrEqual(2);
  });
});

