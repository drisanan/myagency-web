import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { exchangeCode } from '../lib/google'; // Keeping exchangeCode, but generating URL locally for control
import { response } from './cors';
import { putItem } from '../lib/dynamo';
import { GmailTokenRecord } from '../lib/models';
import { google } from 'googleapis'; // Ensure this is imported

const SCOPES = ['https://www.googleapis.com/auth/gmail.compose'];

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  // 1. Identify User (Session)
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  // --- GET /google/oauth/url ---
  if (method === 'GET' && event.rawPath?.endsWith('/google/oauth/url')) {
    // 1. Get the Client ID we want to link
    const clientId = event.queryStringParameters?.clientId;
    if (!clientId) return response(400, { ok: false, error: 'Missing clientId parameter' }, origin);

    try {
      // 2. Initialize OAuth Client locally to fully control the 'state' param
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI
      );

      // 3. Encode clientId into the 'state' parameter (Base64 JSON)
      // This survives the trip to Google and back.
      const statePayload = JSON.stringify({ clientId, agencyId: session.agencyId });
      const state = Buffer.from(statePayload).toString('base64');

      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: SCOPES,
        state: state, // <--- The Fix: Google will return this to us
        prompt: 'consent' // Force refresh token generation
      });

      return response(200, { ok: true, url }, origin);
    } catch (e: any) {
      console.error('Build URL error', e);
      return response(400, { ok: false, error: e?.message || 'Failed to build OAuth URL' }, origin);
    }
  }

  // --- GET /google/oauth/callback ---
  if (method === 'GET' && event.rawPath?.endsWith('/google/oauth/callback')) {
    const code = event.queryStringParameters?.code;
    const state = event.queryStringParameters?.state;

    if (!code) return response(400, { ok: false, error: 'Missing code' }, origin);
    if (!state) return response(400, { ok: false, error: 'Missing state parameter' }, origin);

    try {
      // 4. Decode 'state' to recover the clientId
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      const { clientId } = decodedState;

      if (!clientId) return response(400, { ok: false, error: 'Invalid state: missing clientId' }, origin);

      // 5. Exchange Code for Tokens
      const tokens = await exchangeCode(code);

      // 6. Persist Tokens
      const rec: GmailTokenRecord = {
        PK: `AGENCY#${session.agencyId}`,
        SK: `GMAIL_TOKEN#${clientId}`,
        clientId,
        agencyId: session.agencyId,
        tokens, 
        createdAt: Date.now(),
      };

      await putItem(rec);
      console.log('Google OAuth tokens stored via state flow', { agencyId: session.agencyId, clientId });

      return response(200, { ok: true }, origin);
    } catch (e: any) {
      console.error('OAuth callback error', e);
      return response(400, { ok: false, error: e?.message || 'OAuth exchange failed' }, origin);
    }
  }

  return response(400, { ok: false, error: `Unsupported path ${event.rawPath}` }, origin);
};