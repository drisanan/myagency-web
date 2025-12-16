import { NextRequest, NextResponse } from 'next/server';
import { queryByPK } from '@/infra-adapter/dynamo';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyEmail = (searchParams.get('agencyEmail') || '').trim();
  if (!agencyEmail) return NextResponse.json({ ok: false, error: 'Missing agencyEmail' }, { status: 400 });
  const items = await queryByPK(`AGENCY#${agencyEmail}`, 'FORM#');
  const pending = (items || []).filter((i: any) => !i.consumed);
  return NextResponse.json({ ok: true, items: pending });
}


