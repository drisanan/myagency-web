export type MetricsDay = { date: string; sends: number; opens: number; clicks: number };
export type MetricsResponse = { days: MetricsDay[]; totals?: { sends: number; opens: number }; openRate?: number };

function sliceWindow(days: MetricsDay[], windowSize: number) {
  const window = Math.max(1, windowSize);
  const current = days.slice(-window);
  const previous = days.slice(-window * 2, -window);
  return { current, previous };
}

function sumDays(days: MetricsDay[], key: 'sends' | 'opens' | 'clicks') {
  return days.reduce((acc, day) => acc + (Number(day?.[key]) || 0), 0);
}

function percentDelta(current: number, previous: number) {
  if (previous > 0) return ((current - previous) / previous) * 100;
  return current > 0 ? 100 : 0;
}

export function computeEmailMetrics(
  stats: MetricsResponse | null,
  windowDays = 30,
) {
  const days = stats?.days ?? [];
  const { current, previous } = sliceWindow(days, windowDays);
  const currentSends = sumDays(current, 'sends');
  const previousSends = sumDays(previous, 'sends');
  const emailsSent = currentSends || stats?.totals?.sends || 0;
  const deltaPct = percentDelta(currentSends, previousSends);
  return { emailsSent, deltaPct };
}

export function computeOpenRateMetrics(
  stats: MetricsResponse | null,
  windowDays = 30,
) {
  const days = stats?.days ?? [];
  const { current, previous } = sliceWindow(days, windowDays);
  const currentSends = sumDays(current, 'sends');
  const currentOpens = sumDays(current, 'opens');
  const previousSends = sumDays(previous, 'sends');
  const previousOpens = sumDays(previous, 'opens');

  const openRate = currentSends > 0 ? currentOpens / currentSends : stats?.openRate ?? 0;
  const previousRate = previousSends > 0 ? previousOpens / previousSends : openRate;
  const deltaPct = percentDelta(openRate, previousRate);

  return { openRate, deltaPct };
}

export function countAddedThisMonth(clients: Array<{ createdAt?: string }>) {
  const now = new Date();
  return clients.reduce((acc, client) => {
    if (!client?.createdAt) return acc;
    const created = new Date(client.createdAt);
    if (Number.isNaN(created.getTime())) return acc;
    return created.getFullYear() === now.getFullYear() && created.getMonth() === now.getMonth()
      ? acc + 1
      : acc;
  }, 0);
}

export function formatDelta(deltaPct: number) {
  const rounded = Math.round(deltaPct || 0);
  return `${rounded >= 0 ? '+' : ''}${rounded}%`;
}

/**
 * Compute dashboard metrics from the durable Lambda API responses.
 * Takes a 30-day response (current window) and a 60-day response
 * (current + previous window) to calculate deltas.
 */
export function computeMetricsFromApi(
  current30: { totals?: { sentCount: number; clickCount: number } } | null,
  total60: { totals?: { sentCount: number; clickCount: number } } | null,
) {
  const curSends = current30?.totals?.sentCount ?? 0;
  const allSends = total60?.totals?.sentCount ?? 0;
  const prevSends = Math.max(0, allSends - curSends);
  const emailsSent = curSends;
  const emailsDelta = percentDelta(curSends, prevSends);
  return { emailsSent, emailsDelta };
}