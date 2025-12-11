import { getServiceConfig } from '@/config';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export async function http<T>(path: string, options: { method?: HttpMethod; body?: unknown; headers?: Record<string, string> } = {}): Promise<T> {
  const { apiBaseUrl } = getServiceConfig();
  const url = `${apiBaseUrl}${path}`;
  const res = await fetch(url, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers ?? {})
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store'
  });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  return (await res.json()) as T;
}


