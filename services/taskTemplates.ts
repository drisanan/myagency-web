/**
 * Task Templates Service
 * 
 * Reusable task groups that can be assigned to athletes.
 */

export type ProgramLevel = 'bronze' | 'silver' | 'gold' | 'platinum';

export type TaskTemplateItem = {
  title: string;
  description?: string;
  daysFromAssignment?: number;
  priority?: number;
};

export type TaskTemplate = {
  id: string;
  agencyId: string;
  name: string;
  description?: string;
  programLevel?: ProgramLevel;
  tasks: TaskTemplateItem[];
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
  
  console.log('[taskTemplates.apiFetch]', { url, method: options.method || 'GET' });
  
  const res = await fetch(url, options);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API ${path} failed: ${res.status} ${text}`);
  }
  return res.json();
}

export async function listTaskTemplates(programLevel?: ProgramLevel): Promise<TaskTemplate[]> {
  const params = new URLSearchParams();
  if (programLevel) params.set('programLevel', programLevel);
  
  const qs = params.toString();
  const data = await apiFetch(`/task-templates${qs ? `?${qs}` : ''}`);
  return (data?.templates as TaskTemplate[]) ?? [];
}

export async function getTaskTemplate(id: string): Promise<TaskTemplate | null> {
  const data = await apiFetch(`/task-templates/${id}`);
  return data?.template ?? null;
}

export async function createTaskTemplate(input: {
  name: string;
  description?: string;
  programLevel?: ProgramLevel;
  tasks: TaskTemplateItem[];
}): Promise<TaskTemplate> {
  const data = await apiFetch('/task-templates', {
    method: 'POST',
    body: JSON.stringify(input),
  });
  return data?.template as TaskTemplate;
}

export async function updateTaskTemplate(
  id: string,
  patch: Partial<Omit<TaskTemplate, 'id' | 'createdAt' | 'agencyId'>>
): Promise<TaskTemplate> {
  const data = await apiFetch(`/task-templates/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
  });
  return data?.template as TaskTemplate;
}

export async function deleteTaskTemplate(id: string): Promise<{ ok: boolean }> {
  await apiFetch(`/task-templates/${id}`, { method: 'DELETE' });
  return { ok: true };
}

export async function applyTaskTemplate(templateId: string, clientId: string): Promise<{
  ok: boolean;
  tasks: any[];
  message: string;
}> {
  const data = await apiFetch('/task-templates/apply', {
    method: 'POST',
    body: JSON.stringify({ templateId, clientId }),
  });
  return data;
}
