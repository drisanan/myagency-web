import { getAgencyById } from '@/services/agencies';

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
  const res = await fetch(`${base}${path}`, { ...init, headers });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

type Client = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  sport: string;
  agencyEmail: string;
  agencyId?: string;
  password?: string;
  radar?: any;
  gmailTokens?: any;
  gmailConnected?: boolean;
  createdAt?: string;
};

export async function listClientsByAgencyEmail(agencyEmail: string) {
  const data = await apiFetch('/clients');
  return data?.clients ?? [];
}

export async function listClientsByAgency(agencyId: string) {
  const agency = await getAgencyById(agencyId);
  if (!agency) return [];
  return listClientsByAgencyEmail(agency.email);
}
export async function upsertClient(input: any) {
  const data = await apiFetch('/clients', { method: 'POST', body: JSON.stringify(input) });
  return data?.client;
}
export async function getClient(id: string) {
  const data = await apiFetch(`/clients/${id}`);
  return data?.client ?? null;
}
export async function deleteClient(id: string) {
  await apiFetch(`/clients/${id}`, { method: 'DELETE' });
  return { ok: true };
}
export async function getClients() {
  const data = await apiFetch('/clients');
  return data?.clients ?? [];
}

export function setClientGmailTokens(clientId: string, tokens: any) {
  // No-op; tokens are stored server-side via API.
}

export function getClientGmailTokens(clientId: string): any | null {
  // No-op on client; tokens handled server-side.
  return null;
}


