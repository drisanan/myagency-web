import { NextRequest, NextResponse } from 'next/server';
import { getCachedCommits } from '@/services/commitsCache';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const sport = (searchParams.get('sport') as 'Football' | 'Basketball') || 'Football';
  const list = (searchParams.get('list') as 'recent' | 'top') || 'recent';
  const data = await getCachedCommits(sport, list);
  return NextResponse.json(
    { ok: true, data },
    {
      headers: {
        // small client cache plus stale-while-revalidate hint
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=86400',
      },
    },
  );
}

