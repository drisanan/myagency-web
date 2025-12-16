const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '';

async function apiFetch(path: string, init?: RequestInit) {
  if (!API_BASE_URL || typeof fetch === 'undefined') return null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init?.headers as any) };
  const res = await fetch(`${API_BASE_URL}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

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

export async function listLists(_: string): Promise<CoachList[]> {
  const data = await apiFetch('/lists');
  return (data?.lists as CoachList[]) ?? [];
}

export async function getList(id: string): Promise<CoachList | null> {
  const data = await apiFetch(`/lists/${id}`);
  return (data?.list as CoachList) ?? null;
}

export async function saveList(input: { agencyEmail: string; name: string; items: CoachEntry[] }): Promise<CoachList> {
  const data = await apiFetch('/lists', { method: 'POST', body: JSON.stringify(input) });
  return data?.list as CoachList;
}

export async function updateList(input: { id: string; name: string; items: CoachEntry[] }): Promise<CoachList | null> {
  const data = await apiFetch(`/lists/${input.id}`, { method: 'PUT', body: JSON.stringify(input) });
  return data?.list as CoachList;
}

export async function deleteList(id: string) {
  await apiFetch(`/lists/${id}`, { method: 'DELETE' });
}


