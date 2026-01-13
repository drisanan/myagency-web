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
    credentials: 'include'
  };

  const res = await fetch(url, options);
  
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export type Agent = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role?: string;
  isAdmin?: boolean;
  authEnabled?: boolean;
  agencyId?: string;
  agencyEmail?: string;
  createdAt?: number;
  updatedAt?: number;
};

// Input type for creating/updating agents (includes accessCode for setting password)
export type AgentInput = Partial<Agent> & { 
  email: string; 
  firstName: string; 
  lastName: string;
  accessCode?: string; // Only used when setting/updating password
};

/**
 * List all agents for the current agency (uses session cookie)
 */
export async function listAgents(): Promise<Agent[]> {
  const data = await apiFetch('/agents');
  return data?.agents ?? [];
}

/**
 * Get a single agent by ID
 */
export async function getAgent(id: string): Promise<Agent | null> {
  const data = await apiFetch(`/agents/${id}`);
  return data?.agent ?? null;
}

/**
 * Create or update an agent
 */
export async function upsertAgent(input: AgentInput): Promise<Agent> {
  if (input.id) {
    const data = await apiFetch(`/agents/${input.id}`, { 
      method: 'PUT', 
      body: JSON.stringify(input) 
    });
    return data?.agent;
  } else {
    const data = await apiFetch('/agents', { 
      method: 'POST', 
      body: JSON.stringify(input) 
    });
    return data?.agent;
  }
}

/**
 * Delete an agent (soft delete)
 */
export async function deleteAgent(id: string): Promise<{ ok: boolean }> {
  await apiFetch(`/agents/${id}`, { method: 'DELETE' });
  return { ok: true };
}

