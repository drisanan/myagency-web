import { NextRequest, NextResponse } from 'next/server';
import { listSubmissions } from '../store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyEmail = (searchParams.get('agencyEmail') || '').trim();
  if (!agencyEmail) return NextResponse.json({ ok: false, error: 'Missing agencyEmail' }, { status: 400 });
  const items = listSubmissions(agencyEmail, false);
  return NextResponse.json({ ok: true, items });
}


