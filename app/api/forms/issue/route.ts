import { NextRequest, NextResponse } from 'next/server';
import { sign } from '../../forms/token';

export async function POST(req: NextRequest) {
  try {
    const { agencyEmail } = (await req.json()) as { agencyEmail: string };
    if (!agencyEmail) return NextResponse.json({ ok: false, error: 'Missing agencyEmail' }, { status: 400 });
    const payload = {
      agencyEmail,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
    };
    const token = sign(payload);
    const origin = new URL(req.url).origin;
    const url = `${origin}/forms/${token}`;
    return NextResponse.json({ ok: true, token, url });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to issue form link' }, { status: 500 });
  }
}


