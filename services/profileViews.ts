/**
 * Profile Views Service
 * 
 * Tracks when coaches view athlete profiles.
 */

export type ProfileView = {
  id: string;
  agencyId: string;
  clientId: string;
  viewerEmail?: string;
  viewerName?: string;
  university?: string;
  position?: string;
  viewedAt: number;
  source?: 'email_link' | 'direct' | 'search';
  referrer?: string;
};

export type ProfileViewStats = {
  totalViews: number;
  uniqueViewers: number;
  uniqueUniversities: number;
  topUniversities: Array<{ university: string; count: number }>;
};

export type ProfileViewDigest = {
  clientId: string;
  clientName: string;
  clientEmail?: string;
  totalViews: number;
  uniqueViewers: number;
  universities: string[];
  recentViews: Array<{
    viewerName?: string;
    viewerEmail?: string;
    university?: string;
    position?: string;
    viewedAt: number;
  }>;
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
  
  console.log('[profileViews.apiFetch]', { url, method: options.method || 'GET' });
  
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function getProfileViews(
  clientId: string,
  options?: { since?: number; until?: number; limit?: number }
): Promise<{ views: ProfileView[]; stats: ProfileViewStats }> {
  const params = new URLSearchParams({ clientId });
  if (options?.since) params.set('since', String(options.since));
  if (options?.until) params.set('until', String(options.until));
  if (options?.limit) params.set('limit', String(options.limit));
  
  const data = await apiFetch(`/profile-views?${params}`);
  return {
    views: data?.views ?? [],
    stats: data?.stats ?? { totalViews: 0, uniqueViewers: 0, uniqueUniversities: 0, topUniversities: [] },
  };
}

export async function recordProfileView(input: {
  clientId: string;
  viewerEmail?: string;
  viewerName?: string;
  university?: string;
  position?: string;
  source?: 'email_link' | 'direct' | 'search';
  referrer?: string;
}): Promise<ProfileView> {
  const data = await apiFetch('/profile-views', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data?.view as ProfileView;
}

export async function getWeeklyDigest(clientId?: string): Promise<{
  period: { start: number; end: number };
  digests: ProfileViewDigest[];
  summary: {
    totalViews: number;
    clientsWithViews: number;
    uniqueUniversities: number;
  };
}> {
  const params = new URLSearchParams();
  if (clientId) params.set('clientId', clientId);
  
  const qs = params.toString();
  const data = await apiFetch(`/profile-views/digest${qs ? `?${qs}` : ''}`);
  return data;
}
