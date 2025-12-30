export type ProfileUpdateInput = {
  firstName?: string;
  lastName?: string;
  accessCode?: string;
};

export type ProfileUpdateResponse = {
  ok: boolean;
  profile?: {
    firstName?: string;
    lastName?: string;
  };
  error?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

async function apiFetch(path: string, init?: RequestInit) {
  const base = requireApiBase();
  if (typeof fetch === 'undefined') {
    throw new Error('fetch is not available');
  }
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init?.headers as any) };
  const url = `${base}${path}`;
  const options: RequestInit = { ...init, headers, credentials: 'include' };
  
  const res = await fetch(url, options);
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export async function updateProfile(data: ProfileUpdateInput): Promise<ProfileUpdateResponse> {
  const res = await apiFetch('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return res as ProfileUpdateResponse;
}
