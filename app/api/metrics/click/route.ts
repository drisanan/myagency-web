import { NextRequest, NextResponse } from 'next/server';
import { recordClick, todayISO } from '../store';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const agency = searchParams.get('agency')?.trim();
  const tid = searchParams.get('tid')?.trim();
  const target = searchParams.get('u') || '';

  if (agency && tid) {
    try {
      recordClick(agency, todayISO(), tid);
    } catch {
      // swallow errors to keep redirect working
    }
  }

  let redirectTo = 'https://athletenarrative.com';
  try {
    const url = new URL(target);
    if (['http:', 'https:'].includes(url.protocol)) {
      redirectTo = url.toString();
    }
  } catch {
    // fall back to homepage
  }

  return NextResponse.redirect(redirectTo, { status: 302 });
}
