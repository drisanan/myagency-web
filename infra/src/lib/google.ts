import { google } from 'googleapis';

export function buildOAuthClient() {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI || 'https://api.myrecruiteragency.com/google/oauth/callback';
  if (!clientId || !clientSecret) throw new Error('Missing Google client config');
  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
}

export function buildOAuthUrl(scopes: string[]) {
  const oauth2Client = buildOAuthClient();
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent',
  });
}

export async function exchangeCode(code: string) {
  const oauth2Client = buildOAuthClient();
  const { tokens } = await oauth2Client.getToken(code);
  return tokens;
}

