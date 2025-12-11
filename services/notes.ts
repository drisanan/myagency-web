type Note = {
  id: string;
  athleteId: string;
  agencyEmail: string;
  author?: string;
  title?: string;
  body: string;
  type?: 'call' | 'coach' | 'dm' | 'event' | 'other';
  createdAt: number;
  updatedAt: number;
};

const STORAGE_KEY = 'notes_data';

function readStore(): Note[] {
  if (typeof window === 'undefined') return [];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [];
  try {
    return JSON.parse(raw) as Note[];
  } catch {
    return [];
  }
}

function writeStore(items: Note[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let NOTES: Note[] = readStore();

export function listNotes(athleteId: string, agencyEmail: string) {
  if (typeof window !== 'undefined') NOTES = readStore();
  return NOTES.filter((n) => n.athleteId === athleteId && n.agencyEmail === agencyEmail);
}

export function createNote(input: Partial<Note> & { athleteId: string; agencyEmail: string; body: string }) {
  const now = Date.now();
  const note: Note = {
    id: input.id ?? `n-${now}-${Math.random().toString(36).slice(2, 8)}`,
    athleteId: input.athleteId,
    agencyEmail: input.agencyEmail,
    author: input.author,
    title: input.title,
    body: input.body,
    type: (input.type as Note['type']) ?? 'other',
    createdAt: now,
    updatedAt: now,
  };
  NOTES.unshift(note);
  writeStore(NOTES);
  return note;
}

export function updateNote(id: string, patch: Partial<Note>, agencyEmail: string) {
  if (typeof window !== 'undefined') NOTES = readStore();
  const idx = NOTES.findIndex((n) => n.id === id && n.agencyEmail === agencyEmail);
  if (idx === -1) return null;
  const merged = { ...NOTES[idx], ...patch, updatedAt: Date.now() };
  NOTES[idx] = merged;
  writeStore(NOTES);
  return merged;
}

export function deleteNote(id: string, agencyEmail: string) {
  if (typeof window !== 'undefined') NOTES = readStore();
  const before = NOTES.length;
  NOTES = NOTES.filter((n) => !(n.id === id && n.agencyEmail === agencyEmail));
  if (NOTES.length !== before) writeStore(NOTES);
  return { ok: true };
}


