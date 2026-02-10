import { computeEmailMetrics, computeOpenRateMetrics, countAddedThisMonth, formatDelta, MetricsDay } from '../metrics';

describe('dashboard metrics helpers', () => {
  const days: MetricsDay[] = [
    { date: '2025-01-01', sends: 5, opens: 1, clicks: 0 },
    { date: '2025-01-02', sends: 5, opens: 4, clicks: 0 },
    { date: '2025-01-03', sends: 10, opens: 6, clicks: 0 },
    { date: '2025-01-04', sends: 0, opens: 0, clicks: 0 },
    { date: '2025-01-05', sends: 8, opens: 7, clicks: 0 },
    { date: '2025-01-06', sends: 12, opens: 10, clicks: 0 },
  ];

  test('email metrics compute rolling sums and deltas', () => {
    const stats = { days };
    const { emailsSent, deltaPct } = computeEmailMetrics(stats as any, 3);
    // last 3 days sends: 8 + 12 + 0 = 20
    // prev 3 days sends: 5 + 5 + 10 = 20 => delta 0
    expect(emailsSent).toBe(20);
    expect(deltaPct).toBe(0);
  });

  test('open rate metrics compute from live data only', () => {
    const stats = { days };
    const { openRate, deltaPct } = computeOpenRateMetrics(stats as any, 3);
    // last 3 days: sends=20, opens=17 => rate=0.85
    // prev 3 days: sends=20, opens=11 => rate=0.55
    expect(openRate).toBeCloseTo(0.85, 2);
    expect(deltaPct).toBeCloseTo(54.55, 1);
  });

  test('counts athletes added in current month', () => {
    const now = new Date();
    const thisMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 2)).toISOString();
    const lastMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth() - 1, 2)).toISOString();
    const count = countAddedThisMonth([
      { createdAt: thisMonth },
      { createdAt: thisMonth },
      { createdAt: lastMonth },
      {},
    ]);
    expect(count).toBe(2);
  });

  test('formatDelta prefixes sign', () => {
    expect(formatDelta(10.2)).toBe('+10%');
    expect(formatDelta(-2.5)).toBe('-2%');
  });
});
