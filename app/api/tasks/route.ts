import { NextRequest, NextResponse } from 'next/server';
import { createTask, deleteTask, listTasks, updateTask } from '@/services/tasks';

function getAgencyEmail(req: NextRequest, bodyAgency?: string) {
  return req.headers.get('x-agency-email') || bodyAgency || '';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyEmail = getAgencyEmail(req, searchParams.get('agencyEmail') || undefined);
  if (!agencyEmail) {
    return NextResponse.json({ ok: false, error: 'agencyEmail is required' }, { status: 400 });
  }
  const athleteId = searchParams.get('athleteId') || undefined;
  const status = (searchParams.get('status') || undefined) as any;
  const data = listTasks({ agencyEmail, athleteId, status });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const agencyEmail = getAgencyEmail(req, body?.agencyEmail);
  const { title, description, status, dueAt, athleteId } = body || {};
  if (!agencyEmail || !title?.trim()) {
    return NextResponse.json({ ok: false, error: 'agencyEmail and title are required' }, { status: 400 });
  }
  const created = createTask({
    agencyEmail,
    title: title.trim(),
    description: description?.trim(),
    status,
    dueAt: Number.isFinite(dueAt) ? Number(dueAt) : undefined,
    athleteId: athleteId || null,
  });
  return NextResponse.json({ ok: true, data: created });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const agencyEmail = getAgencyEmail(req, body?.agencyEmail);
  const { id, ...patch } = body || {};
  if (!id || !agencyEmail) {
    return NextResponse.json({ ok: false, error: 'id and agencyEmail are required' }, { status: 400 });
  }
  const updated = updateTask(id, patch);
  if (!updated) return NextResponse.json({ ok: false, error: 'Task not found' }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = body?.id;
  const agencyEmail = getAgencyEmail(req, body?.agencyEmail);
  if (!id || !agencyEmail) {
    return NextResponse.json({ ok: false, error: 'id and agencyEmail are required' }, { status: 400 });
  }
  deleteTask(id);
  return NextResponse.json({ ok: true });
}


