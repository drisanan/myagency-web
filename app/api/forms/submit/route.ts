import { NextRequest, NextResponse } from 'next/server';
import { verify } from '../../forms/token';
import { putItem } from '@/infra-adapter/dynamo';

type Submission = {
  id: string;
  createdAt: number;
  data: any;
  consumed?: boolean;
  agencyEmail: string;
  agencyId?: string;
};

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

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
    const id = newId('form');
    const rec: Submission = {
      id,
      createdAt: Date.now(),
      consumed: false,
      agencyEmail: payload.agencyEmail,
      data: {
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
      },
    };
    await putItem({
      PK: `AGENCY#${payload.agencyEmail}`,
      SK: `FORM#${id}`,
      ...rec,
    });
    console.info('[intake-api:submit:success]', { id, agencyEmail: payload.agencyEmail });
    return NextResponse.json({ ok: true, id });
  } catch (e: any) {
    console.error('[intake-api:submit:error]', { error: e?.message });
    return NextResponse.json({ ok: false, error: e?.message || 'Submit failed' }, { status: 500 });
  }
}


