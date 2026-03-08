import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBaseUrl } from '@/config/env';

type BackendJsonResult = {
  response: Response;
  data: any;
  text: string;
};

function buildBackendUrl(req: NextRequest, path: string, includeSearchParams = true) {
  const base = getServerApiBaseUrl().replace(/\/$/, '');
  const url = new URL(`${base}${path.startsWith('/') ? path : `/${path}`}`);
  if (includeSearchParams) {
    const incoming = new URL(req.url);
    incoming.searchParams.forEach((value, key) => url.searchParams.set(key, value));
  }
  return url;
}

function buildHeaders(req: NextRequest, extraHeaders?: Record<string, string>) {
  const headers = new Headers(extraHeaders);
  const cookie = req.headers.get('cookie');
  const contentType = req.headers.get('content-type');

  if (cookie) headers.set('cookie', cookie);
  if (contentType && !headers.has('content-type')) headers.set('content-type', contentType);

  return headers;
}

export async function fetchBackendJson(
  req: NextRequest,
  path: string,
  options?: {
    method?: string;
    body?: string;
    includeSearchParams?: boolean;
    headers?: Record<string, string>;
  },
): Promise<BackendJsonResult> {
  const method = options?.method || req.method;
  const body = options?.body ?? (['GET', 'HEAD'].includes(method.toUpperCase()) ? undefined : await req.text());
  const response = await fetch(buildBackendUrl(req, path, options?.includeSearchParams).toString(), {
    method,
    headers: buildHeaders(req, options?.headers),
    body,
    cache: 'no-store',
  });

  const text = await response.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  return { response, data, text };
}

export async function proxyBackendJson(
  req: NextRequest,
  path: string,
  options?: Parameters<typeof fetchBackendJson>[2],
) {
  const { response, data, text } = await fetchBackendJson(req, path, options);
  if (data !== null) {
    return NextResponse.json(data, { status: response.status });
  }
  return new NextResponse(text, {
    status: response.status,
    headers: {
      'content-type': response.headers.get('content-type') || 'text/plain; charset=utf-8',
    },
  });
}
