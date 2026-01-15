/**
 * Coach Notes Service
 * 
 * Notes associated with coaches/schools, separate from athlete notes.
 */

export type CoachNote = {
  id: string;
  agencyId: string;
  coachEmail: string;
  coachName?: string;
  university?: string;
  athleteId?: string;
  author: string;
  title?: string;
  body: string;
  type?: 'call' | 'email' | 'meeting' | 'other';
  createdAt: number;
  updatedAt: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

async function apiFetch(path: string, init?: RequestInit) {
  const base = requireApiBase();
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json', 
    ...(init?.headers as any) 
  };
  const url = `${base}${path}`;
  const options: RequestInit = { ...init, headers, credentials: 'include' };
  
  console.log('[coachNotes.apiFetch]', { url, method: options.method || 'GET' });
  
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function listCoachNotes(filters?: {
  coachEmail?: string;
  university?: string;
  athleteId?: string;
}): Promise<CoachNote[]> {
  const params = new URLSearchParams();
  if (filters?.coachEmail) params.set('coachEmail', filters.coachEmail);
  if (filters?.university) params.set('university', filters.university);
  if (filters?.athleteId) params.set('athleteId', filters.athleteId);
  
  const qs = params.toString();
  const data = await apiFetch(`/coach-notes${qs ? `?${qs}` : ''}`);
  return (data?.notes as CoachNote[]) ?? [];
}

export async function getCoachNote(id: string): Promise<CoachNote | null> {
  const data = await apiFetch(`/coach-notes/${id}`);
  return data?.note ?? null;
}

export async function createCoachNote(input: {
  coachEmail: string;
  coachName?: string;
  university?: string;
  athleteId?: string;
  title?: string;
  body: string;
  type?: 'call' | 'email' | 'meeting' | 'other';
}): Promise<CoachNote> {
  const data = await apiFetch('/coach-notes', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data?.note as CoachNote;
}

export async function updateCoachNote(
  id: string,
  patch: Partial<Omit<CoachNote, 'id' | 'createdAt' | 'agencyId'>>
): Promise<CoachNote> {
  const data = await apiFetch(`/coach-notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return data?.note as CoachNote;
}

export async function deleteCoachNote(id: string): Promise<{ ok: boolean }> {
  await apiFetch(`/coach-notes/${id}`, { method: 'DELETE' });
  return { ok: true };
}
