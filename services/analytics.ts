const KEY = 'dashboard_open_clicks_v1';

type DayMetrics = { opens: number; clicks: number };
type Store = { [agencyEmail: string]: { [dateISO: string]: DayMetrics } };

function todayISO(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

export function getOpensClicksByDate(agencyEmail: string, days = 14): Array<{ date: string; opens: number; clicks: number }> {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(KEY);
    const obj = raw ? (JSON.parse(raw) as Store) : {};
    const map = obj[agencyEmail] || {};
    const out: Array<{ date: string; opens: number; clicks: number }> = [];
    const base = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(base);
      d.setDate(base.getDate() - i);
      const k = todayISO(d);
      const row = map[k] || { opens: 0, clicks: 0 };
      out.push({ date: k, opens: row.opens || 0, clicks: row.clicks || 0 });
    }
    return out;
  } catch {
    return [];
  }
}

export function setOpensClicks(agencyEmail: string, dateISO: string, metrics: Partial<DayMetrics>) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const obj = raw ? (JSON.parse(raw) as Store) : {};
    const perAgency = obj[agencyEmail] || {};
    const prev = perAgency[dateISO] || { opens: 0, clicks: 0 };
    perAgency[dateISO] = { opens: Math.max(0, Number(metrics.opens ?? prev.opens)), clicks: Math.max(0, Number(metrics.clicks ?? prev.clicks)) };
    obj[agencyEmail] = perAgency;
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch {}
}


