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

export type Campaign = {
  id: string;
  clientId: string;
  subject: string;
  html: string;
  recipients: Array<{ email: string; name?: string; university?: string }>;
  senderClientId: string;
  campaignName?: string;
  scheduledAt?: number;
  sentAt?: number;
  status: 'draft' | 'scheduled' | 'sent' | 'failed';
};

export async function createCampaign(input: {
  clientId: string;
  subject: string;
  html: string;
  recipients: Array<{ email: string; name?: string; university?: string }>;
  senderClientId: string;
  campaignName?: string;
  scheduledAt?: number;
  personalizedMessage?: string;
  status?: 'draft' | 'scheduled' | 'sent' | 'failed';
}) {
  const data = await apiFetch('/campaigns', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data?.campaign as Campaign;
}

export async function updateCampaign(id: string, patch: Partial<Campaign>) {
  const data = await apiFetch(`/campaigns?id=${encodeURIComponent(id)}`, {
    method: 'PATCH',
    body: JSON.stringify({ id, ...patch }),
  });
  return data?.campaign as Campaign;
}

export async function listCampaigns(clientId?: string) {
  const qs = clientId ? `?clientId=${encodeURIComponent(clientId)}` : '';
  const data = await apiFetch(`/campaigns${qs}`);
  return data?.campaigns as Campaign[];
}
