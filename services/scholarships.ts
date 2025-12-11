const KEY = 'dashboard_scholarships_v1';

type Store = { [agencyEmail: string]: number };

export function getScholarships(agencyEmail: string): number {
  if (typeof window === 'undefined') return 0;
  try {
    const raw = localStorage.getItem(KEY);
    const obj = raw ? (JSON.parse(raw) as Store) : {};
    return obj[agencyEmail] ?? 0;
  } catch {
    return 0;
  }
}

export function setScholarships(agencyEmail: string, n: number) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem(KEY);
    const obj = raw ? (JSON.parse(raw) as Store) : {};
    obj[agencyEmail] = Math.max(0, Number(n) || 0);
    localStorage.setItem(KEY, JSON.stringify(obj));
  } catch {}
}


