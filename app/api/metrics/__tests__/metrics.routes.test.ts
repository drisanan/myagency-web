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
  test('open pixel records opens', async () => {
    const date = todayISO();
    const req = new NextRequest(`http://localhost/api/metrics/open?tid=abc&agency=${agencyEmail}`);
    const res = await openHandler(req);
    expect(res.status).toBe(200);

    const stats = getStats(agencyEmail, 1);
    expect(stats.totals.opens).toBeGreaterThanOrEqual(1);
    expect(stats.days[0].date).toBe(date);
  });

  test('click redirect records clicks and respects url', async () => {
    const target = 'https://example.com/page';
    const req = new NextRequest(
      `http://localhost/api/metrics/click?tid=def&agency=${agencyEmail}&u=${encodeURIComponent(target)}`,
    );
    const res = await clickHandler(req);
    expect(res.status).toBe(302);
    expect(res.headers.get('location')).toBe(target);
    const stats = getStats(agencyEmail, 1);
    expect(stats.days[0].clicks).toBeGreaterThanOrEqual(1);
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

