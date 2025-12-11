import { NextResponse } from 'next/server';
import { footballScrapeStatus, basketballScrapeStatus } from '@/services/commits';

export async function GET() {
  return NextResponse.json({
    ok: true,
    football: footballScrapeStatus(),
    basketball: basketballScrapeStatus(),
  });
}


