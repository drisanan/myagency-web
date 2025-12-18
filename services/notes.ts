export type Note = {
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

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

// Standardized fetch wrapper ensuring credentials (cookies) are sent
async function apiFetch(path: string, init?: RequestInit) {
  const base = requireApiBase();
  if (typeof fetch === 'undefined') {
    throw new Error('fetch is not available');
  }

  const headers: Record<string, string> = { 
    'Content-Type': 'application/json', 
    ...(init?.headers as any) 
  };

  const url = `${base}${path}`;
  
  const options: RequestInit = { 
    ...init, 
    headers, 
    credentials: 'include' // <--- Key for session persistence
  };

  console.log('[notes.apiFetch]', {
    url,
    method: options.method || 'GET',
    hasBody: Boolean(options.body),
    credentials: options.credentials,
  });

  const res = await fetch(url, options);

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function listNotes(athleteId: string, agencyEmail: string): Promise<Note[]> {
  // GET /notes?athleteId=...&agencyEmail=...
  const params = new URLSearchParams({ athleteId, agencyEmail });
  const data = await apiFetch(`/notes?${params.toString()}`);
  return (data?.notes as Note[]) ?? [];
}

export async function createNote(input: Partial<Note> & { athleteId: string; agencyEmail: string; body: string }): Promise<Note> {
  // POST /notes
  const data = await apiFetch('/notes', {
    method: 'POST',
    body: JSON.stringify(input)
  });
  return data?.note as Note;
}

export async function updateNote(id: string, patch: Partial<Note>, agencyEmail: string): Promise<Note | null> {
  // PATCH /notes/:id
  // We can pass agencyEmail in the body for backend verification if needed, 
  // though the session cookie usually handles auth.
  const data = await apiFetch(`/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ ...patch, agencyEmail })
  });
  return (data?.note as Note) ?? null;
}

export async function deleteNote(id: string, agencyEmail: string) {
  // DELETE /notes/:id
  await apiFetch(`/notes/${id}`, { method: 'DELETE' });
  return { ok: true };
}