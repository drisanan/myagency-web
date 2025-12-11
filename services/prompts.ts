const STORAGE_KEY = 'ai_prompts_v1';

export type PromptRecord = {
  id: string;
  agencyEmail: string;
  clientId?: string;
  name: string;
  text: string;
  createdAt: number;
  updatedAt: number;
};

function read(): PromptRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as PromptRecord[]) : [];
  } catch {
    return [];
  }
}

function write(items: PromptRecord[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function listPrompts(input: { agencyEmail: string; clientId?: string }): PromptRecord[] {
  const all = read();
  return all
    .filter(p => p.agencyEmail === input.agencyEmail && (input.clientId ? p.clientId === input.clientId : true))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export function savePrompt(input: { agencyEmail: string; clientId?: string; name: string; text: string }): PromptRecord {
  const all = read();
  const id = `p-${Math.random().toString(36).slice(2, 10)}`;
  const now = Date.now();
  const rec: PromptRecord = {
    id,
    agencyEmail: input.agencyEmail,
    clientId: input.clientId,
    name: input.name,
    text: input.text,
    createdAt: now,
    updatedAt: now,
  };
  write([rec, ...all]);
  return rec;
}

export function deletePrompt(id: string) {
  const all = read();
  write(all.filter(p => p.id !== id));
}


