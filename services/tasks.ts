export type TaskStatus = 'todo' | 'in-progress' | 'done';

export type Task = {
  id: string;
  agencyEmail?: string;
  agencyId?: string;
  athleteId?: string | null; // legacy
  assigneeClientId?: string | null;
  assigneeAgentId?: string | null;
  title: string;
  description?: string;
  status: TaskStatus;
  dueAt?: number; // ms epoch
  createdAt: number;
  updatedAt: number;
  deletedAt?: string;
};

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
  const url = `${base}${path}`;
  const options: RequestInit = { ...init, headers, credentials: 'include' };
  // Lightweight logging to help diagnose missing session/cookies
  console.log('[tasks.apiFetch]', {
    url,
    method: options.method || 'GET',
    hasBody: Boolean(options.body),
    hasContentType: Boolean(headers['Content-Type']),
    credentials: options.credentials,
  });
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function listTasks(input: { assigneeClientId?: string | null; status?: TaskStatus; athleteId?: string | null }) {
  const params = new URLSearchParams();
  const assignee = input.assigneeClientId || input.athleteId; // support legacy param name
  if (assignee) params.set('assigneeClientId', assignee);
  if (input.status) params.set('status', input.status);
  const qs = params.toString();
  const data = await apiFetch(`/tasks${qs ? `?${qs}` : ''}`);
  return (data?.tasks as Task[]) ?? [];
}

export async function createTask(input: {
  title: string;
  description?: string;
  status?: TaskStatus;
  dueAt?: number;
  assigneeClientId?: string | null;
  assigneeAgentId?: string | null;
  athleteId?: string | null; // legacy alias
}) {
  const payload = {
    ...input,
    assigneeClientId: input.assigneeClientId ?? input.athleteId ?? null,
    assigneeAgentId: input.assigneeAgentId ?? null,
  };
  const data = await apiFetch('/tasks', { method: 'POST', body: JSON.stringify(payload) });
  return data?.task as Task;
}

export async function updateTask(id: string, patch: Partial<Omit<Task, 'id' | 'createdAt'>>) {
  const payload = {
    ...patch,
    assigneeClientId: (patch as any).assigneeClientId ?? (patch as any).athleteId ?? patch.assigneeClientId,
    assigneeAgentId: patch.assigneeAgentId,
  };
  const data = await apiFetch(`/tasks/${id}`, { method: 'PATCH', body: JSON.stringify(payload) });
  return data?.task as Task;
}

export async function deleteTask(id: string) {
  await apiFetch(`/tasks/${id}`, { method: 'DELETE' });
  return { ok: true };
}

export function tasksDueSoon(tasks: Task[], withinMs = 24 * 60 * 60 * 1000) {
  const now = Date.now();
  return tasks.filter((t) => t.dueAt && t.status !== 'done' && t.dueAt - now <= withinMs && t.dueAt >= now);
}


