export type Client = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  sport: string;
  agencyId: string;
  agencyEmail?: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

// The Critical Helper: Ensures credentials (cookies) are sent with every request
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
    credentials: 'include' // <--- THIS FIXES THE 401 "MISSING SESSION"
  };

  // Logging to match tasks.ts pattern for debugging
  console.log('[clients.apiFetch]', {
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

export async function listClients() {
  // GET /clients
  const data = await apiFetch('/clients');
  return (data?.clients as Client[]) ?? [];
}

export async function getClient(id: string) {
  // GET /clients/:id
  const data = await apiFetch(`/clients/${id}`);
  return data?.client as Client | null;
}

export async function createClient(input: {
  email: string;
  firstName: string;
  lastName: string;
  sport: string;
}) {
  // POST /clients
  const data = await apiFetch('/clients', { 
    method: 'POST', 
    body: JSON.stringify(input) 
  });
  return data?.client as Client;
}

export async function updateClient(id: string, patch: Partial<Omit<Client, 'id' | 'createdAt' | 'agencyId'>>) {
  // PATCH /clients/:id
  const data = await apiFetch(`/clients/${id}`, { 
    method: 'PATCH', 
    body: JSON.stringify(patch) 
  });
  return data?.client as Client;
}

export async function deleteClient(id: string) {
  // DELETE /clients/:id
  await apiFetch(`/clients/${id}`, { method: 'DELETE' });
  return { ok: true };
}