import { NextRequest, NextResponse } from 'next/server';
import { recordOpen, todayISO } from '../store';

const PIXEL = Buffer.from('R0lGODlhAQABAIABAP///wAAACwAAAAAAQABAAACAkQBADs=', 'base64');

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agency = searchParams.get('agency')?.trim();
  const tid = searchParams.get('tid')?.trim();
  if (agency && tid) {
    try {
      recordOpen(agency, todayISO(), tid);
    } catch {
      // swallow errors to avoid impacting email rendering
    }
  }
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
