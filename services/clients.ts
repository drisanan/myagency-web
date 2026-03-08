import { getAgencyById } from '@/services/agencies';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || '/api';

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

export class ClientApiError extends Error {
  status: number;
  code?: string;
  fieldErrors?: Record<string, string>;
  requestId?: string;

  constructor(message: string, options: { status: number; code?: string; fieldErrors?: Record<string, string>; requestId?: string }) {
    super(message);
    this.name = 'ClientApiError';
    this.status = options.status;
    this.code = options.code;
    this.fieldErrors = options.fieldErrors;
    this.requestId = options.requestId;
  }
}

function createRequestId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `client-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

// Standardized fetch wrapper ensuring credentials (cookies) are sent
async function apiFetch(path: string, init?: RequestInit) {
  const base = requireApiBase();
  if (typeof fetch === 'undefined') {
    throw new Error('fetch is not available');
  }
  
  const requestId = createRequestId();
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json', 
    'x-client-request-id': requestId,
    ...(init?.headers as any) 
  };
  
  const url = `${base}${path}`;
  
  const options: RequestInit = { 
    ...init, 
    headers, 
    credentials: 'include' // <--- THIS FIXES THE 401 "MISSING SESSION"
  };

  console.log('[clients.apiFetch]', {
    url,
    method: options.method || 'GET',
    hasBody: Boolean(options.body),
    credentials: options.credentials,
  });

  const res = await fetch(url, options);
  
  if (!res.ok) {
    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = null;
    }
    throw new ClientApiError(
      data?.error || text || `API ${path} failed`,
      { status: res.status, code: data?.code, fieldErrors: data?.fieldErrors, requestId },
    );
  }
  return res.json().catch(() => ({}));
}

export type Client = {
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
  // The backend uses the session cookie to determine the agency, 
  // so we just call /clients.
  const data = await apiFetch('/clients');
  return data?.clients ?? [];
}

export async function listClientsByAgency(agencyId: string) {
  // Just delegates to listClientsByAgencyEmail, which uses the session.
  const agency = await getAgencyById(agencyId);
  if (!agency) return [];
  return listClientsByAgencyEmail(agency.email);
}

export async function upsertClient(input: any) {
  if (input.id) {
    return updateClient(input.id, input);
  }
  return createClient(input);
}

export async function createClient(input: any) {
  console.log('[clients] Creating new client');
  const data = await apiFetch('/clients', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data?.client;
}

export async function updateClient(id: string, input: any) {
  console.log('[clients] Updating existing client', id);
  const data = await apiFetch(`/clients/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
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

export async function setClientGmailTokens(clientId: string, tokens: any) {
  // Persist tokens to server for the given client
  await apiFetch('/google/tokens', {
    method: 'POST',
    body: JSON.stringify({ clientId, tokens }),
  });
}

export function getClientGmailTokens(clientId: string): any | null {
  // No-op on client; tokens handled server-side.
  return null;
}

export type GmailStatus = {
  connected: boolean;
  expired: boolean;
  canRefresh: boolean;
  expiryDate?: number;
};

export async function getGmailStatus(clientId: string): Promise<GmailStatus> {
  const data = await apiFetch(`/google/status?clientId=${encodeURIComponent(clientId)}`);
  return {
    connected: data?.connected ?? false,
    expired: data?.expired ?? false,
    canRefresh: data?.canRefresh ?? false,
    expiryDate: data?.expiryDate,
  };
}

export async function refreshGmailToken(clientId: string): Promise<{ ok: boolean; error?: string }> {
  const data = await apiFetch('/google/refresh', {
    method: 'POST',
    body: JSON.stringify({ clientId }),
  });
  return data;
}

export async function refreshAgentGmailToken(agentId: string): Promise<{ ok: boolean; error?: string }> {
  const data = await apiFetch('/google/refresh', {
    method: 'POST',
    body: JSON.stringify({ agentId }),
  });
  return data;
}

export async function deleteGmailTokens(clientId: string): Promise<void> {
  await apiFetch(`/google/disconnect?clientId=${encodeURIComponent(clientId)}`, {
    method: 'DELETE',
  });
}