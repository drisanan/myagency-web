import { NextRequest, NextResponse } from 'next/server';
import { createNote, deleteNote, listNotes, updateNote } from '@/services/notes';

function getAgencyEmail(req: NextRequest, bodyAgency?: string) {
  return req.headers.get('x-agency-email') || bodyAgency || '';
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const athleteId = searchParams.get('athleteId') || '';
  const agencyEmail = getAgencyEmail(req, searchParams.get('agencyEmail') || undefined);
  if (!athleteId || !agencyEmail) {
    return NextResponse.json({ ok: false, error: 'athleteId and agencyEmail are required' }, { status: 400 });
  }
  const data = listNotes(athleteId, agencyEmail).sort((a, b) => b.createdAt - a.createdAt);
  return NextResponse.json({ ok: true, data });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const agencyEmail = getAgencyEmail(req, body?.agencyEmail);
  const { athleteId, body: noteBody, title, type, author } = body || {};
  if (!agencyEmail || !athleteId || !noteBody?.trim()) {
    return NextResponse.json({ ok: false, error: 'athleteId, agencyEmail, and body are required' }, { status: 400 });
  }
  const created = createNote({ athleteId, agencyEmail, body: noteBody.trim(), title, type, author });
  return NextResponse.json({ ok: true, data: created });
}

export async function PATCH(req: NextRequest) {
  const body = await req.json();
  const agencyEmail = getAgencyEmail(req, body?.agencyEmail);
  const { id, ...patch } = body || {};
  if (!id || !agencyEmail) {
    return NextResponse.json({ ok: false, error: 'id and agencyEmail are required' }, { status: 400 });
  }
  const updated = updateNote(id, patch, agencyEmail);
  if (!updated) return NextResponse.json({ ok: false, error: 'Note not found' }, { status: 404 });
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const id = body?.id;
  const agencyEmail = getAgencyEmail(req, body?.agencyEmail);
  if (!id || !agencyEmail) {
    return NextResponse.json({ ok: false, error: 'id and agencyEmail are required' }, { status: 400 });
  }
  deleteNote(id, agencyEmail);
  return NextResponse.json({ ok: true });
}


