const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

// Standardized fetch wrapper ensuring credentials (cookies) are sent
export async function apiFetch(path: string, init?: RequestInit) {
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
    credentials: 'include' // <--- THIS FIXES THE 401 "MISSING SESSION"
  };

  console.log('[lists.apiFetch]', {
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
  // The backend uses the session cookie to identify the agency, 
  // so the argument '_' is technically unused here but kept for signature compatibility.
  const data = await apiFetch('/lists');
  return (data?.lists as CoachList[]) ?? [];
}

export async function getList(id: string): Promise<CoachList | null> {
  const data = await apiFetch(`/lists/${id}`);
  return (data?.list as CoachList) ?? null;
}

export async function saveList(input: { agencyEmail: string; name: string; items: CoachEntry[] }): Promise<CoachList> {
  const data = await apiFetch('/lists', { 
    method: 'POST', 
    body: JSON.stringify(input) 
  });
  return data?.list as CoachList;
}

export async function updateList(input: { id: string; name: string; items: CoachEntry[] }): Promise<CoachList | null> {
  const data = await apiFetch(`/lists/${input.id}`, { 
    method: 'PUT', 
    body: JSON.stringify(input) 
  });
  return data?.list as CoachList;
}

export async function deleteList(id: string) {
  await apiFetch(`/lists/${id}`, { method: 'DELETE' });
}