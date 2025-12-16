import { NextRequest, NextResponse } from 'next/server';
import { rehydrateCommitsCache } from '@/services/commitsCache';

export async function POST(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const provided = req.headers.get('x-cron-secret');
  if (secret && provided !== secret) {
    return new NextResponse('unauthorized', { status: 401 });
  }

  await rehydrateCommitsCache();
  return NextResponse.json({ ok: true });
}


