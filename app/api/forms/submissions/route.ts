import { NextRequest, NextResponse } from 'next/server';
import { queryByPK, queryGSI1 } from '@/infra-adapter/dynamo';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agencyEmail = (searchParams.get('agencyEmail') || '').trim();
  if (!agencyEmail) return NextResponse.json({ ok: false, error: 'Missing agencyEmail' }, { status: 400 });

  const agencies = await queryGSI1(`EMAIL#${agencyEmail}`, 'AGENCY#');
  const agency = (agencies || [])[0] as { id: string } | undefined;
  if (!agency) return NextResponse.json({ ok: true, items: [] });

  const items = await queryByPK(`AGENCY#${agency.id}`, 'FORM#');
  const pending = (items || []).filter((i: any) => !i.consumed);
  return NextResponse.json({ ok: true, items: pending });
}
