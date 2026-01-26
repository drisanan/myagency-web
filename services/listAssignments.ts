const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

async function apiFetch(path: string, init?: RequestInit) {
  const base = requireApiBase();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init?.headers as any) };
  const res = await fetch(`${base}${path}`, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export type ListAssignment = {
  id: string;
  listId: string;
  clientId: string;
  assignedAt: number;
  assignedBy?: string;
};

export async function listAssignments(params?: { clientId?: string; listId?: string; includeLists?: boolean }) {
  const qs = new URLSearchParams();
  if (params?.clientId) qs.set('clientId', params.clientId);
  if (params?.listId) qs.set('listId', params.listId);
  if (params?.includeLists) qs.set('includeLists', 'true');
  const data = await apiFetch(`/list-assignments${qs.toString() ? `?${qs.toString()}` : ''}`);
  return data;
}

export async function assignListToClient(clientId: string, listId: string) {
  const data = await apiFetch('/list-assignments', {
    method: 'POST',
    body: JSON.stringify({ clientId, listId }),
  });
  return data?.assignment as ListAssignment;
}

export async function unassignListFromClient(clientId: string, listId: string) {
  await apiFetch(`/list-assignments?clientId=${encodeURIComponent(clientId)}&listId=${encodeURIComponent(listId)}`, {
    method: 'DELETE',
  });
  return { ok: true };
}
