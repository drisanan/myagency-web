import { NextRequest, NextResponse } from 'next/server';
import { getTokens, saveTokens } from '../../google/tokenStore';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId') || '';
  const tokens = getTokens(clientId);
  console.info('[gmail-tokens:get]', {
    clientId,
    exists: Boolean(tokens),
    hasAccess: Boolean(tokens?.access_token),
    hasRefresh: Boolean(tokens?.refresh_token),
  });
  return NextResponse.json({ ok: true, tokens: tokens || null });
}

export async function POST(req: NextRequest) {
  try {
    const { clientId, tokens } = (await req.json()) as { clientId: string; tokens: any };
    if (!clientId || !tokens) {
      return NextResponse.json({ ok: false, error: 'Missing clientId or tokens' }, { status: 400 });
    }
    console.info('[gmail-tokens:post]', {
      clientId,
      hasAccess: Boolean(tokens?.access_token),
      hasRefresh: Boolean(tokens?.refresh_token),
      expiry: tokens?.expiry_date,
    });
    saveTokens(clientId, tokens);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message || 'Failed to import tokens' }, { status: 500 });
  }
}


