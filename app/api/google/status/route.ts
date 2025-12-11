import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from '../../google/tokenStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId') || '';
  const tokens = getTokens(clientId);
  const connected = Boolean(tokens?.refresh_token || tokens?.access_token);
  console.info('[gmail-status]', { clientId, connected });
  return NextResponse.json({ ok: true, connected });
}


