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
    credentials: 'include' // <--- THIS FIXES THE 401 "MISSING SESSION"
  };

  console.log('[agencies.apiFetch]', {
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

export type ProgramLevelConfig = {
  value: string;
  label: string;
  color: string;
};

export type AgencySettings = {
  primaryColor?: string;
  secondaryColor?: string;
  headerBg?: string;
  logoDataUrl?: string;
  preferredSport?: string;
  programLevels?: ProgramLevelConfig[];
};

export type Agency = {
  id: string;
  name: string;
  email: string;
  password?: string;
  ownerFirstName?: string;
  ownerLastName?: string;
  ownerEmail?: string;
  ownerPhone?: string;
  active?: boolean;
  slug?: string;
  settings?: AgencySettings;
};

const SEED_AGENCIES: Agency[] = [
  { id: 'agency-001', name: 'Prime Sports', email: 'agency1@an.test', settings: { primaryColor: '#1976d2' } },
  { id: 'agency-002', name: 'NextGen', email: 'agency2@an.test', settings: { primaryColor: '#9c27b0' } },
  { id: 'agency-003', name: 'Elite Edge', email: 'agency3@an.test', settings: { primaryColor: '#2e7d32' } },
];

export async function listAgencies() {
  const data = await apiFetch('/agencies');
  return data?.agencies ?? [];
}

export async function getAgencies() {
  const data = await apiFetch('/agencies');
  return data?.agencies ?? [];
}

export async function getAgencyByEmail(email: string) {
  const data = await apiFetch('/agencies');
  const list = data?.agencies ?? [];
  const target = String(email || '').trim().toLowerCase();
  return list.find((a: Agency) => String(a.email || '').trim().toLowerCase() === target) ?? null;
}

export async function getAgencyById(id: string) {
  const data = await apiFetch('/agencies');
  const list = data?.agencies ?? [];
  return list.find((a: Agency) => a.id === id) ?? null;
}

export async function getAgencySettings(email: string) {
  const data = await apiFetch(`/agencies?email=${encodeURIComponent(email)}`);
  const list = data?.agencies ?? [];
  const target = String(email || '').trim().toLowerCase();
  const a = list.find((x: Agency) => String(x.email || '').trim().toLowerCase() === target);
  // Return settings plus slug for the settings form
  return { ...(a?.settings ?? {}), slug: a?.slug };
}

export async function updateAgencySettings(email: string, settings: AgencySettings) {
  const data = await apiFetch('/agencies/settings', { 
    method: 'PUT', 
    body: JSON.stringify({ email, settings }) 
  });
  return data;
}

type UpsertInput = Omit<Agency, 'id'> & { id?: string };

export async function upsertAgency(input: UpsertInput) {
  const data = await apiFetch('/agencies', { 
    method: 'POST', 
    body: JSON.stringify(input) 
  });
  return data;
}

export async function createAgencyFromGHL(input: { name?: string; email: string; color?: string; logoUrl?: string }) {
  const payload: UpsertInput = {
    name: input.name || 'New Agency',
    email: input.email,
    settings: {
      primaryColor: input.color,
      logoDataUrl: input.logoUrl,
    },
  };
  const res = await apiFetch('/agencies', { 
    method: 'POST', 
    body: JSON.stringify(payload) 
  });
  const id = res?.id || res?.agency?.id;
  return { id, ...payload };
}

export async function deleteAgency(id: string) {
  const data = await apiFetch(`/agencies/${id}`, { method: 'DELETE' });
  return data ?? { ok: true };
}