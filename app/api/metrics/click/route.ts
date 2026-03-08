import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBaseUrl } from '@/config/env';

export async function GET(req: NextRequest) {
  const incoming = new URL(req.url);
  const redirectUrl = new URL(`${getServerApiBaseUrl().replace(/\/$/, '')}/r`);
  const target = incoming.searchParams.get('u') || '';
  const agency = incoming.searchParams.get('agency') || '';
  const tid = incoming.searchParams.get('tid') || '';

  if (target) redirectUrl.searchParams.set('d', target);
  if (agency) redirectUrl.searchParams.set('g', agency);
  if (tid) redirectUrl.searchParams.set('tid', tid);

  return NextResponse.redirect(redirectUrl, { status: 302 });
}
