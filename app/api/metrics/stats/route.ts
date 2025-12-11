import { NextRequest, NextResponse } from 'next/server';
import { getStats } from '../store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyEmail = (searchParams.get('agencyEmail') || '').trim();
  const days = Math.max(1, Math.min(60, Number(searchParams.get('days') || 14)));
  if (!agencyEmail) return NextResponse.json({ ok: false, error: 'Missing agencyEmail' }, { status: 400 });
  const stats = getStats(agencyEmail, days);
  return NextResponse.json({ ok: true, ...stats });
}


