/**
 * Activity Service
 * 
 * Tracks and reports on user activities.
 */

export type ActivityType = 
  | 'login'
  | 'profile_update'
  | 'task_completed'
  | 'email_sent'
  | 'email_opened'
  | 'profile_viewed_by_coach'
  | 'list_created'
  | 'meeting_requested'
  | 'form_submitted';

export type Activity = {
  id: string;
  agencyId: string;
  clientId?: string;
  agentId?: string;
  actorEmail: string;
  actorType: 'agent' | 'athlete' | 'coach' | 'system';
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
  createdAt: number;
};

export type ActivityReport = {
  period: {
    day: { start: number; count: number };
    week: { start: number; count: number };
    month: { start: number; count: number };
  };
  byType: Record<string, number>;
  coachActivity: {
    count: number;
    recent: Activity[];
  };
  athleteActivity: {
    count: number;
    recent: Activity[];
  };
  recentActivities: Activity[];
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
  
  console.log('[activity.apiFetch]', { url, method: options.method || 'GET' });
  
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function listActivities(filters?: {
  clientId?: string;
  type?: ActivityType;
  actorType?: 'agent' | 'athlete' | 'coach' | 'system';
  since?: number;
  until?: number;
  limit?: number;
}): Promise<Activity[]> {
  const params = new URLSearchParams();
  if (filters?.clientId) params.set('clientId', filters.clientId);
  if (filters?.type) params.set('type', filters.type);
  if (filters?.actorType) params.set('actorType', filters.actorType);
  if (filters?.since) params.set('since', String(filters.since));
  if (filters?.until) params.set('until', String(filters.until));
  if (filters?.limit) params.set('limit', String(filters.limit));
  
  const qs = params.toString();
  const data = await apiFetch(`/activity${qs ? `?${qs}` : ''}`);
  return (data?.activities as Activity[]) ?? [];
}

export async function logActivity(input: {
  clientId?: string;
  agentId?: string;
  actorType?: 'agent' | 'athlete' | 'coach' | 'system';
  activityType: ActivityType;
  description: string;
  metadata?: Record<string, unknown>;
}): Promise<Activity> {
  const data = await apiFetch('/activity', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data?.activity as Activity;
}

export async function getActivityReport(clientId?: string): Promise<ActivityReport> {
  const params = new URLSearchParams();
  if (clientId) params.set('clientId', clientId);
  
  const qs = params.toString();
  const data = await apiFetch(`/activity/report${qs ? `?${qs}` : ''}`);
  return data?.report as ActivityReport;
}
