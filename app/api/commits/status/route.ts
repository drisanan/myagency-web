import { NextResponse } from 'next/server';
import { readPersistedCommitsSnapshot } from '@/services/commits';

export async function GET() {
  const snapshot = await readPersistedCommitsSnapshot();
  return NextResponse.json({
    ok: true,
    football: { scraped: Boolean(snapshot?.footballScraped), updatedAt: snapshot?.updatedAt || null },
    basketball: { scraped: Boolean(snapshot?.basketballScraped), updatedAt: snapshot?.updatedAt || null },
  });
}


