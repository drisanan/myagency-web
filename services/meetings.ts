/**
 * Meetings Service
 * 
 * In-platform meeting scheduling between agents and athletes.
 */

export type MeetingStatus = 'pending' | 'confirmed' | 'declined' | 'cancelled' | 'completed';

export type MeetingRequest = {
  id: string;
  agencyId: string;
  clientId: string;
  requestedBy: 'agent' | 'athlete';
  agentEmail?: string;
  athleteEmail?: string;
  title: string;
  description?: string;
  scheduledAt?: number;
  proposedTimes?: number[];
  duration?: number;
  meetingLink?: string;
  status: MeetingStatus;
  notes?: string;
  createdAt: number;
  updatedAt: number;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

async function apiFetch(path: string, init?: RequestInit) {
  const base = requireApiBase();
  const headers: Record<string, string> = { 
    'Content-Type': 'application/json', 
    ...(init?.headers as any) 
  };
  const url = `${base}${path}`;
  const options: RequestInit = { ...init, headers, credentials: 'include' };
  
  console.log('[meetings.apiFetch]', { url, method: options.method || 'GET' });
  
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function listMeetings(filters?: {
  clientId?: string;
  status?: MeetingStatus;
  upcoming?: boolean;
}): Promise<MeetingRequest[]> {
  const params = new URLSearchParams();
  if (filters?.clientId) params.set('clientId', filters.clientId);
  if (filters?.status) params.set('status', filters.status);
  if (filters?.upcoming) params.set('upcoming', 'true');
  
  const qs = params.toString();
  const data = await apiFetch(`/meetings${qs ? `?${qs}` : ''}`);
  return (data?.meetings as MeetingRequest[]) ?? [];
}

export async function getMeeting(id: string): Promise<MeetingRequest | null> {
  const data = await apiFetch(`/meetings/${id}`);
  return data?.meeting ?? null;
}

export async function createMeetingRequest(input: {
  clientId: string;
  title: string;
  description?: string;
  scheduledAt?: number;
  proposedTimes?: number[];
  duration?: number;
  meetingLink?: string;
  notes?: string;
}): Promise<MeetingRequest> {
  const data = await apiFetch('/meetings', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data?.meeting as MeetingRequest;
}

export async function updateMeeting(
  id: string,
  patch: Partial<Omit<MeetingRequest, 'id' | 'createdAt' | 'agencyId' | 'clientId'>>
): Promise<MeetingRequest> {
  const data = await apiFetch(`/meetings/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return data?.meeting as MeetingRequest;
}

export async function confirmMeeting(id: string, scheduledAt: number, meetingLink?: string): Promise<MeetingRequest> {
  return updateMeeting(id, { status: 'confirmed', scheduledAt, meetingLink });
}

export async function declineMeeting(id: string, notes?: string): Promise<MeetingRequest> {
  return updateMeeting(id, { status: 'declined', notes });
}

export async function cancelMeeting(id: string): Promise<{ ok: boolean }> {
  await apiFetch(`/meetings/${id}`, { method: 'DELETE' });
  return { ok: true };
}

export async function completeMeeting(id: string, notes?: string): Promise<MeetingRequest> {
  return updateMeeting(id, { status: 'completed', notes });
}
