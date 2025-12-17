const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

async function apiFetch(path: string, init?: RequestInit) {
  const base = requireApiBase();
  if (typeof fetch === 'undefined') return null;
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(init?.headers as any) };
  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export type AgencySettings = {
  primaryColor?: string;
  secondaryColor?: string;
  logoDataUrl?: string;
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
  settings?: AgencySettings;
};

const SEED_AGENCIES: Agency[] = [
  { id: 'agency-001', name: 'Prime Sports', email: 'agency1@an.test', settings: { primaryColor: '#1976d2' } },
  { id: 'agency-002', name: 'NextGen', email: 'agency2@an.test', settings: { primaryColor: '#9c27b0' } },
  { id: 'agency-003', name: 'Elite Edge', email: 'agency3@an.test', settings: { primaryColor: '#2e7d32' } },
];

export async function listAgencies() {
  if (API_BASE_URL) {
    const data = await apiFetch('/agencies');
    return data?.agencies ?? [];
  }
  return [];
}

export async function getAgencies() {
  if (API_BASE_URL) {
    const data = await apiFetch('/agencies');
    return data?.agencies ?? [];
  }
  return [];
}

export async function getAgencyByEmail(email: string) {
  if (API_BASE_URL) {
    const data = await apiFetch('/agencies');
    const list = data?.agencies ?? [];
    return list.find((a: Agency) => a.email === email) ?? null;
  }
  return null;
}

export async function getAgencyById(id: string) {
  if (API_BASE_URL) {
    const data = await apiFetch('/agencies');
    const list = data?.agencies ?? [];
    return list.find((a: Agency) => a.id === id) ?? null;
  }
  return null;
}

export async function getAgencySettings(email: string) {
  if (API_BASE_URL) {
    const data = await apiFetch(`/agencies?email=${encodeURIComponent(email)}`);
    const list = data?.agencies ?? [];
    const a = list.find((x: Agency) => x.email === email);
    return a?.settings ?? {};
  }
  return {};
}

export async function updateAgencySettings(email: string, settings: AgencySettings) {
  if (API_BASE_URL) {
    const data = await apiFetch('/agencies/settings', { method: 'PUT', body: JSON.stringify({ email, settings }) });
    return data;
  }
  return { ok: false };
}

type UpsertInput = Omit<Agency, 'id'> & { id?: string };
export async function upsertAgency(input: UpsertInput) {
  if (API_BASE_URL) {
    const data = await apiFetch('/agencies', { method: 'POST', body: JSON.stringify(input) });
    return data;
  }
  return { id: undefined };
}

export async function createAgencyFromGHL(input: { name?: string; email: string; color?: string; logoUrl?: string }) {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  const payload: UpsertInput = {
    name: input.name || 'New Agency',
    email: input.email,
    settings: {
      primaryColor: input.color,
      logoDataUrl: input.logoUrl,
    },
  };
  const res = await apiFetch('/agencies', { method: 'POST', body: JSON.stringify(payload) });
  const id = res?.id || res?.agency?.id;
  return { id, ...payload };
}

export async function deleteAgency(id: string) {
  if (API_BASE_URL) {
    const data = await apiFetch(`/agencies/${id}`, { method: 'DELETE' });
    return data ?? { ok: true };
  }
  return { ok: false };
}


