const STORAGE_KEY = 'coach_lists_v1';

export type CoachEntry = {
  id?: string;
  firstName?: string;
  lastName?: string;
  email: string;
  title?: string;
  school: string;
  division: string;
  state: string;
};

export type CoachList = {
  id: string;
  agencyEmail: string;
  name: string;
  items: CoachEntry[];
  createdAt: number;
  updatedAt: number;
};

function read(): CoachList[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as CoachList[]) : [];
  } catch {
    return [];
  }
}

function write(items: CoachList[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listLists(agencyEmail: string): CoachList[] {
  const all = read();
  return all
    .filter(l => l.agencyEmail === agencyEmail)
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function getList(id: string): CoachList | null {
  const all = read();
  return all.find(l => l.id === id) ?? null;
}

export function saveList(input: { agencyEmail: string; name: string; items: CoachEntry[] }): CoachList {
  const all = read();
  const id = `list-${Math.random().toString(36).slice(2, 10)}`;
  const now = Date.now();
  const rec: CoachList = { id, agencyEmail: input.agencyEmail, name: input.name, items: input.items, createdAt: now, updatedAt: now };
  write([rec, ...all]);
  return rec;
}

export function updateList(input: { id: string; name: string; items: CoachEntry[] }): CoachList | null {
  const all = read();
  const idx = all.findIndex(l => l.id === input.id);
  if (idx < 0) return null;
  const now = Date.now();
  const next = { ...all[idx], name: input.name, items: input.items, updatedAt: now };
  all[idx] = next;
  write(all);
  return next;
}

export function deleteList(id: string) {
  const all = read();
  write(all.filter(l => l.id !== id));
}


