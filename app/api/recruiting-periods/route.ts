import { NextRequest, NextResponse } from 'next/server';
import { listRecruitingPeriods } from '@/services/recruitingPeriods';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sport = searchParams.get('sport') || 'Football';
  const data = listRecruitingPeriods(sport);
  return NextResponse.json({ ok: true, data });
}


