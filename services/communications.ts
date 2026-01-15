/**
 * Communications Service
 * 
 * Central hub for agent-athlete-coach communications.
 */

export type CommunicationType = 
  | 'agent_to_athlete' 
  | 'athlete_to_agent' 
  | 'agent_to_coach' 
  | 'coach_to_athlete' 
  | 'athlete_to_coach';

export type Communication = {
  id: string;
  agencyId: string;
  threadId?: string;
  type: CommunicationType;
  fromEmail: string;
  fromName?: string;
  toEmail: string;
  toName?: string;
  athleteId?: string;
  coachEmail?: string;
  university?: string;
  subject?: string;
  body: string;
  isRead?: boolean;
  attachments?: string[];
  createdAt: number;
};

export type CommunicationThread = {
  threadId: string;
  subject: string;
  participants: string[];
  athleteId?: string;
  coachEmail?: string;
  university?: string;
  messageCount: number;
  unreadCount: number;
  lastMessage: {
    id: string;
    fromEmail: string;
    body: string;
    createdAt: number;
  };
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
  
  console.log('[communications.apiFetch]', { url, method: options.method || 'GET' });
  
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function listCommunications(filters?: {
  threadId?: string;
  clientId?: string;
  type?: CommunicationType;
  coachEmail?: string;
  limit?: number;
}): Promise<Communication[]> {
  const params = new URLSearchParams();
  if (filters?.threadId) params.set('threadId', filters.threadId);
  if (filters?.clientId) params.set('clientId', filters.clientId);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.coachEmail) params.set('coachEmail', filters.coachEmail);
  if (filters?.limit) params.set('limit', String(filters.limit));
  
  const qs = params.toString();
  const data = await apiFetch(`/communications${qs ? `?${qs}` : ''}`);
  return (data?.communications as Communication[]) ?? [];
}

export async function getCommunication(id: string): Promise<Communication | null> {
  const data = await apiFetch(`/communications/${id}`);
  return data?.communication ?? null;
}

export async function sendCommunication(input: {
  type: CommunicationType;
  toEmail: string;
  toName?: string;
  fromName?: string;
  athleteId?: string;
  coachEmail?: string;
  university?: string;
  subject?: string;
  body: string;
  threadId?: string;
  attachments?: string[];
}): Promise<Communication> {
  const data = await apiFetch('/communications', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data?.communication as Communication;
}

export async function markAsRead(id: string): Promise<Communication> {
  const data = await apiFetch(`/communications/${id}`, {
    method: 'PATCH',
    body: JSON.stringify({ isRead: true }),
  });
  return data?.communication as Communication;
}

export async function listThreads(athleteId?: string): Promise<CommunicationThread[]> {
  const params = new URLSearchParams();
  if (athleteId) params.set('athleteId', athleteId);
  
  const qs = params.toString();
  const data = await apiFetch(`/communications/threads${qs ? `?${qs}` : ''}`);
  return (data?.threads as CommunicationThread[]) ?? [];
}
