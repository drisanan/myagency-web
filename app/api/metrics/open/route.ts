import { NextRequest, NextResponse } from 'next/server';
import { getServerApiBaseUrl } from '@/config/env';

const PIXEL = Buffer.from('R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');

export async function GET(req: NextRequest) {
  const incoming = new URL(req.url);
  const url = new URL(`${getServerApiBaseUrl().replace(/\/$/, '')}/email-metrics/open`);
  incoming.searchParams.forEach((value, key) => url.searchParams.set(key, value));

  try {
    const response = await fetch(url.toString(), { cache: 'no-store' });
    const body = Buffer.from(await response.arrayBuffer());
    return new NextResponse(body, {
      status: response.status,
      headers: {
        'Content-Type': response.headers.get('content-type') || 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'Content-Length': body.length.toString(),
      },
    });
  } catch {
    return new NextResponse(PIXEL, {
      status: 200,
      headers: {
        'Content-Type': 'image/gif',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        Pragma: 'no-cache',
        Expires: '0',
        'Content-Length': PIXEL.length.toString(),
      },
    });
  }
}
