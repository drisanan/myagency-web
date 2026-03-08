import { NextRequest, NextResponse } from 'next/server';
import { fetchBackendJson } from '@/app/api/_lib/backendProxy';

export async function GET(req: NextRequest) {
  const { response, data } = await fetchBackendJson(req, '/notes');
  return NextResponse.json({ ok: Boolean(data?.ok), data: data?.notes ?? [] }, { status: response.status });
}

export async function POST(req: NextRequest) {
  const { response, data } = await fetchBackendJson(req, '/notes');
  return NextResponse.json({ ok: Boolean(data?.ok), data: data?.note ?? null, error: data?.error }, { status: response.status });
}

export async function PATCH(req: NextRequest) {
  const rawBody = await req.json().catch(() => ({}));
  const { id, ...patch } = rawBody || {};
  if (!id) {
    return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 });
  }
  const { response, data } = await fetchBackendJson(req, `/notes/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(patch),
    includeSearchParams: false,
    headers: { 'content-type': 'application/json' },
  });
  return NextResponse.json({ ok: Boolean(data?.ok), data: data?.note ?? null, error: data?.error }, { status: response.status });
}

export async function DELETE(req: NextRequest) {
  const rawBody = await req.json().catch(() => ({}));
  const id = rawBody?.id;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 });
  }
  const { response, data } = await fetchBackendJson(req, `/notes/${id}`, {
    method: 'DELETE',
    body: '',
    includeSearchParams: false,
  });
  return NextResponse.json({ ok: Boolean(data?.ok) }, { status: response.status });
}


