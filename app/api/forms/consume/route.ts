import { NextRequest, NextResponse } from 'next/server';
import { consumeSubmissions } from '../store';

export async function POST(req: NextRequest) {
  try {
    const { agencyEmail, ids } = (await req.json()) as { agencyEmail: string; ids: string[] };
    if (!agencyEmail || !Array.isArray(ids)) {
      return NextResponse.json({ ok: false, error: 'Missing parameters' }, { status: 400 });
    }
    consumeSubmissions(agencyEmail, ids);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Consume failed' }, { status: 500 });
  }
}


