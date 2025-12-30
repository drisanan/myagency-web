import { NextRequest, NextResponse } from 'next/server';
import { createTask, deleteTask, listTasks, updateTask } from '@/services/tasks';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const assigneeClientId = searchParams.get('assigneeClientId') || searchParams.get('athleteId') || undefined;
  const status = (searchParams.get('status') || undefined) as any;
  const data = await listTasks({ assigneeClientId, status });
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, description, status, dueAt, assigneeClientId, athleteId } = body || {};
  if (!title?.trim()) {
    return NextResponse.json({ ok: false, error: 'title is required' }, { status: 400 });
  }
  const created = await createTask({
    title: title.trim(),
    description: description?.trim(),
    status,
    dueAt: Number.isFinite(dueAt) ? Number(dueAt) : undefined,
    assigneeClientId: assigneeClientId ?? athleteId ?? null,
  });
  return NextResponse.json({ ok: true, data: created });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const { id, ...patch } = body || {};
  if (!id) {
    return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 });
  }
  const updated = await updateTask(id, patch);
  if (!updated) return NextResponse.json({ ok: false, error: 'Task not found' }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = body?.id;
  if (!id) {
    return NextResponse.json({ ok: false, error: 'id is required' }, { status: 400 });
  }
  await deleteTask(id);
  return NextResponse.json({ ok: true });
}


