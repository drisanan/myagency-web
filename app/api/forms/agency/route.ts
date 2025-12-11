import { NextRequest, NextResponse } from 'next/server';
import { verify } from '../../forms/token';
import { getAgencyByEmail } from '@/services/agencies';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = (searchParams.get('token') || '').trim();
    const payload = verify<{ agencyEmail: string; exp?: number }>(token || '');
    if (!payload?.agencyEmail) {
      return NextResponse.json({ ok: false, error: 'Invalid token' }, { status: 400 });
    }
    const agency = await getAgencyByEmail(payload.agencyEmail);
    if (!agency) return NextResponse.json({ ok: false, error: 'Agency not found' }, { status: 404 });
    return NextResponse.json({
      ok: true,
      agency: {
        name: agency.name,
        email: agency.email,
        settings: agency.settings || {},
      },
    });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to resolve agency' }, { status: 500 });
  }
}


