type ByDayCount = { [dateISO: string]: number };
type ByDayTidSet = { [dateISO: string]: Set<string> };

type AgencyMapCount = { [agencyEmail: string]: ByDayCount };
type AgencyMapTidSet = { [agencyEmail: string]: ByDayTidSet };

const sends: AgencyMapCount = {};
const opens: AgencyMapTidSet = {};
const clicks: AgencyMapTidSet = {};

export function todayISO(d = new Date()) {
  return d.toISOString().slice(0, 10);
}

function ensureCount(map: AgencyMapCount, agency: string, day: string) {
  if (!map[agency]) map[agency] = {};
  if (!map[agency][day]) map[agency][day] = 0;
}
function ensureSet(map: AgencyMapTidSet, agency: string, day: string) {
  if (!map[agency]) map[agency] = {};
  if (!map[agency][day]) map[agency][day] = new Set<string>();
}

export function recordSend(agencyEmail: string, day: string, count: number) {
  if (!agencyEmail || !day || !Number.isFinite(count)) return;
  ensureCount(sends, agencyEmail, day);
  sends[agencyEmail][day] += Math.max(0, count);
}
export function recordOpen(agencyEmail: string, day: string, tid: string) {
  if (!agencyEmail || !day || !tid) return;
  ensureSet(opens, agencyEmail, day);
  opens[agencyEmail][day].add(tid);
}
export function recordClick(agencyEmail: string, day: string, tid: string) {
  if (!agencyEmail || !day || !tid) return;
  ensureSet(clicks, agencyEmail, day);
  clicks[agencyEmail][day].add(tid);
}

export function getStats(agencyEmail: string, days: number) {
  const out: Array<{ date: string; sends: number; opens: number; clicks: number }> = [];
  const base = new Date();
  let totalSends = 0;
  let totalOpens = 0;
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(base);
    d.setDate(base.getDate() - i);
    const k = todayISO(d);
    const s = sends[agencyEmail]?.[k] || 0;
    const o = opens[agencyEmail]?.[k]?.size || 0;
    const c = clicks[agencyEmail]?.[k]?.size || 0;
    totalSends += s;
    totalOpens += o;
    out.push({ date: k, sends: s, opens: o, clicks: c });
  }
  const openRate = totalSends > 0 ? totalOpens / totalSends : 0;
  return { days: out, totals: { sends: totalSends, opens: totalOpens }, openRate };
}


