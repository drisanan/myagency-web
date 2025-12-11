import { NextRequest, NextResponse } from 'next/server';
import { verify } from '../../forms/token';
import { putSubmission } from '../store';

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const body = await req.json().catch(() => ({}));
    const token = (body.token || searchParams.get('token') || '').trim();
    const form = body.form || {};
    const payload = verify<{ agencyEmail: string; exp?: number }>(token);
    console.info('[intake-api:submit:start]', { hasToken: Boolean(token), agencyEmail: payload?.agencyEmail });
    if (!payload?.agencyEmail) {
      return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });
    }
    const safeForm = form || {};
    const rec = putSubmission(payload.agencyEmail, {
      email: safeForm.email || '',
      phone: safeForm.phone || '',
      password: safeForm.password || '',
      firstName: safeForm.firstName || '',
      lastName: safeForm.lastName || '',
      sport: safeForm.sport || '',
      division: safeForm.division || '',
      graduationYear: safeForm.graduationYear || '',
      profileImageUrl: safeForm.profileImageUrl || '',
      radar: safeForm.radar || {},
    });
    console.info('[intake-api:submit:success]', { id: rec.id, agencyEmail: payload.agencyEmail });
    return NextResponse.json({ ok: true, id: rec.id });
  } catch (e: any) {
    console.error('[intake-api:submit:error]', { error: e?.message });
    return NextResponse.json({ ok: false, error: e?.message || 'Submit failed' }, { status: 500 });
  }
}


