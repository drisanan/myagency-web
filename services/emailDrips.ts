const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

async function apiFetch(path: string, init?: RequestInit) {
  const base = requireApiBase();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init?.headers as any),
  };
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export type DripEmailStep = {
  id: string;
  dayOffset: number;
  subject: string;
  body: string;
  templateId?: string;
};

export type EmailDrip = {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  senderClientId?: string;
  triggerEvent?: 'signup' | 'program_change' | 'manual';
  programLevel?: string;
  steps: DripEmailStep[];
  createdAt: number;
  updatedAt: number;
};

export type DripEnrollment = {
  dripId: string;
  clientId: string;
  currentStepIndex: number;
  startedAt: number;
  nextSendAt?: number;
  lastSentAt?: number;
  completedAt?: number;
  pausedAt?: number;
};

export async function listEmailDrips(): Promise<EmailDrip[]> {
  const data = await apiFetch('/email-drips');
  return data?.drips ?? [];
}

export async function createEmailDrip(input: Partial<EmailDrip>) {
  const data = await apiFetch('/email-drips', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data?.drip as EmailDrip;
}

export async function updateEmailDrip(id: string, input: Partial<EmailDrip>) {
  const data = await apiFetch(`/email-drips/${id}`, {
    method: 'PUT',
    body: JSON.stringify(input),
  });
  return data?.drip as EmailDrip;
}

export async function deleteEmailDrip(id: string) {
  await apiFetch(`/email-drips/${id}`, { method: 'DELETE' });
  return { ok: true };
}

export async function listDripEnrollments(filters?: { clientId?: string; dripId?: string }) {
  const qs = new URLSearchParams();
  if (filters?.clientId) qs.set('clientId', filters.clientId);
  if (filters?.dripId) qs.set('dripId', filters.dripId);
  const data = await apiFetch(`/email-drips/enrollments${qs.toString() ? `?${qs.toString()}` : ''}`);
  return data?.enrollments as DripEnrollment[] || [];
}

export async function enrollInDrip(dripId: string, clientId: string) {
  const data = await apiFetch('/email-drips/enroll', {
    method: 'POST',
    body: JSON.stringify({ dripId, clientId }),
  });
  return data?.enrollment as DripEnrollment;
}

export async function unenrollFromDrip(dripId: string, clientId: string) {
  const data = await apiFetch('/email-drips/enroll', {
    method: 'DELETE',
    body: JSON.stringify({ dripId, clientId }),
  });
  return data;
}

export async function getGmailStatus(clientId: string) {
  return apiFetch(`/google/status?clientId=${encodeURIComponent(clientId)}`);
}

export async function getGmailOauthUrl(clientId: string) {
  return apiFetch(`/google/oauth/url?clientId=${encodeURIComponent(clientId)}`);
}

export async function runDripRunner() {
  return apiFetch('/email-drips/run', { method: 'POST' });
}
