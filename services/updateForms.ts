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

export async function issueUpdateForm(clientId: string) {
  const data = await apiFetch('/update-forms/issue', {
    method: 'POST',
    body: JSON.stringify({ clientId }),
  });
  return data as { ok: boolean; url: string; token: string };
}

export async function listUpdateForms(clientId?: string) {
  const qs = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
  const data = await apiFetch(`/update-forms/submissions${qs}`);
  return data?.items ?? [];
}
