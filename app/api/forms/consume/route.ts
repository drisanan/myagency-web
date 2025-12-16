import { NextRequest, NextResponse } from 'next/server';
import { getItem, putItem } from '@/infra-adapter/dynamo';

export async function POST(req: NextRequest) {
  try {
    const { agencyEmail, ids } = (await req.json()) as { agencyEmail: string; ids: string[] };
    if (!agencyEmail || !Array.isArray(ids)) {
      return NextResponse.json({ ok: false, error: 'Missing parameters' }, { status: 400 });
    }
    for (const id of ids) {
      const item = await getItem({ PK: `AGENCY#${agencyEmail}`, SK: `FORM#${id}` });
      if (item) {
        await putItem({ ...item, consumed: true });
      }
    }
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Consume failed' }, { status: 500 });
  }
}


