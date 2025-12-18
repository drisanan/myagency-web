export type PromptRecord = {
  id: string;
  agencyEmail: string;
  clientId?: string;
  name: string;
  text: string;
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
    credentials: 'include' // <--- Ensures the session cookie is passed
  };

  console.log('[prompts.apiFetch]', {
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

export async function listPrompts(input: { agencyEmail: string; clientId?: string }): Promise<PromptRecord[]> {
  const params = new URLSearchParams();
  // We pass these as query params. 
  // Note: The backend should ideally verify the agencyEmail matches the session.
  if (input.agencyEmail) params.set('agencyEmail', input.agencyEmail);
  if (input.clientId) params.set('clientId', input.clientId);

  const data = await apiFetch(`/prompts?${params.toString()}`);
  return (data?.prompts as PromptRecord[]) ?? [];
}

export async function savePrompt(input: { agencyEmail: string; clientId?: string; name: string; text: string }): Promise<PromptRecord> {
  const data = await apiFetch('/prompts', {
    method: 'POST',
    body: JSON.stringify(input)
  });
  return data?.prompt as PromptRecord;
}

export async function deletePrompt(id: string) {
  await apiFetch(`/prompts/${id}`, { method: 'DELETE' });
  return { ok: true };
}