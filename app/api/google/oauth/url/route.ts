import { NextResponse } from 'next/server';

const SCOPES = ['https://www.googleapis.com/auth/gmail.compose'];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const clientId = searchParams.get('clientId') || '';

  const { google } = await import('googleapis');
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
  );

  const url = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    scope: SCOPES,
    include_granted_scopes: true,
    state: clientId,
  });

  // Log minimal, non-sensitive info
  console.info('[gmail-oauth:url]', {
    clientId,
    hasRedirect: Boolean(process.env.GOOGLE_REDIRECT_URI),
  });

  return NextResponse.json({ url });
}


