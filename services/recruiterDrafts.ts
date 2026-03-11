const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

async function apiFetch(path: string, init?: RequestInit) {
  const base = requireApiBase();
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init?.headers as Record<string, string>) };
  const res = await fetch(`${base}${path}`, { ...init, headers, credentials: 'include' });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export type RecruiterDraft = {
  id: string;
  agencyId: string;
  name: string;
  senderType: 'client' | 'agent';
  clientId?: string;
  agentId?: string;
  subject: string;
  html: string;
  division?: string;
  state?: string;
  schoolName?: string;
  listId?: string;
  selectedCoachIds?: string[];
  autoSaved?: boolean;
  createdAt: number;
  updatedAt: number;
};

export async function listDrafts(): Promise<RecruiterDraft[]> {
  const data = await apiFetch('/recruiter-drafts');
  return (data?.drafts ?? []) as RecruiterDraft[];
}

export async function getDraft(id: string): Promise<RecruiterDraft> {
  const data = await apiFetch(`/recruiter-drafts/${encodeURIComponent(id)}`);
  return data?.draft as RecruiterDraft;
}

export async function saveDraft(input: Partial<RecruiterDraft> & { name: string }): Promise<RecruiterDraft> {
  const data = await apiFetch('/recruiter-drafts', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data?.draft as RecruiterDraft;
}

export async function updateDraft(id: string, patch: Partial<RecruiterDraft>): Promise<RecruiterDraft> {
  const data = await apiFetch(`/recruiter-drafts/${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ id, ...patch }),
  });
  return data?.draft as RecruiterDraft;
}

export async function deleteDraft(id: string): Promise<void> {
  await apiFetch(`/recruiter-drafts/${encodeURIComponent(id)}`, { method: 'DELETE' });
}
