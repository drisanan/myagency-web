import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { requireSession } from './common';
import { response } from './cors';
import { putItem, getItem } from '../lib/dynamo'; // Added getItem
import { google } from 'googleapis';

// Fallback logic ensures we always have a valid string, even if env var fails
const API_DOMAIN = 'api.myrecruiteragency.com';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `https://${API_DOMAIN}/google/oauth/callback`;
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.myrecruiteragency.com';

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.compose',
  'email',
  'openid'
];

export const handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const path = event.rawPath || event.requestContext.http?.path || '';

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  // 1. Identify User (Session)
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  // 2. Validate Config (Critical check)
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Missing Google Credentials in Env');
    return response(500, { ok: false, error: 'Server configuration error' }, origin);
  }

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI
  );

  // =========================================================================
  // ROUTE: Generate Login URL
  // GET /google/oauth/url?clientId=...
  // =========================================================================
  if (method === 'GET' && path.endsWith('/google/oauth/url')) {
    const clientId = event.queryStringParameters?.clientId;
    if (!clientId) return response(400, { ok: false, error: 'Missing clientId parameter' }, origin);

    try {
      const statePayload = JSON.stringify({ clientId, agencyId: session.agencyId });
      const state = Buffer.from(statePayload).toString('base64');

      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Critical for refresh_token
        scope: SCOPES,
        state: state,
        prompt: 'consent', 
        include_granted_scopes: true
      });

      console.log('Generated Google OAuth URL', { redirectUri: REDIRECT_URI });
      return response(200, { ok: true, url }, origin);
    } catch (e: any) {
      console.error('Build URL error', e);
      return response(400, { ok: false, error: e?.message || 'Failed to build OAuth URL' }, origin);
    }
  }

  // =========================================================================
  // ROUTE: Handle Callback
  // GET /google/oauth/callback?code=...&state=...
  // =========================================================================
  if (method === 'GET' && path.endsWith('/google/oauth/callback')) {
    const code = event.queryStringParameters?.code;
    const state = event.queryStringParameters?.state;
    const error = event.queryStringParameters?.error;

    if (error) {
       return {
         statusCode: 200,
         headers: { 'Content-Type': 'text/html' },
         body: `<script>window.close();</script>` 
       };
    }

    if (!code || !state) return response(400, { ok: false, error: 'Missing code or state' }, origin);

    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      const { clientId } = decodedState;

      if (!clientId) return response(400, { ok: false, error: 'Invalid state' }, origin);

      const { tokens } = await oauth2Client.getToken(code);

      // Persist Tokens
      const tokenRecord = {
        PK: `AGENCY#${session.agencyId}`,
        SK: `GMAIL_TOKEN#${clientId}`,
        clientId,
        agencyId: session.agencyId,
        tokens, 
        createdAt: Date.now(),
      };

      await putItem(tokenRecord);
      console.log('Tokens saved for client:', clientId);

      const successPayload = { type: 'google-oauth-success', clientId, tokens };

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <html><body>
          <script>
            (function() {
              var payload = ${JSON.stringify(successPayload)};
              try {
                if (window.opener) {
                  window.opener.postMessage(payload, '${FRONTEND_URL}');
                }
              } catch (e) {
                console.error('postMessage failed', e);
              }
              window.close();
            })();
          </script>
          <p>Connected! You can close this window.</p>
          </body></html>
        `
      };

    } catch (e: any) {
      console.error('OAuth callback error', e);
      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: `<script>alert('Connection failed: ${e.message}'); window.close();</script>`
      };
    }
  }

  // =========================================================================
  // ROUTE: Save Tokens Manually (from UI)
  // POST /google/tokens
  // =========================================================================
  if (method === 'POST' && path.endsWith('/google/tokens')) {
    const body = JSON.parse(event.body || '{}');
    if (!body.clientId || !body.tokens) return response(400, { ok: false, error: 'Missing data' }, origin);
    
    const tokenRecord = {
      PK: `AGENCY#${session.agencyId}`,
      SK: `GMAIL_TOKEN#${body.clientId}`,
      clientId: body.clientId,
      agencyId: session.agencyId,
      tokens: body.tokens, 
      createdAt: Date.now(),
    };

    await putItem(tokenRecord);
    return response(200, { ok: true }, origin);
  }

  // =========================================================================
  // ROUTE: Get Tokens (Internal use)
  // GET /google/tokens?clientId=...
  // =========================================================================
  if (method === 'GET' && path.endsWith('/google/tokens')) {
    const clientId = event.queryStringParameters?.clientId;
    if (!clientId) return response(400, { ok: false, error: 'Missing clientId' }, origin);
    
    const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `GMAIL_TOKEN#${clientId}` });
    return response(200, { ok: true, tokens: item?.tokens || null }, origin);
  }

  // =========================================================================
  // ROUTE: Check Status (For UI indicators)
  // GET /google/status?clientId=...
  // =========================================================================
  if (method === 'GET' && path.endsWith('/google/status')) {
    try {
      const clientId = event.queryStringParameters?.clientId;
      if (!clientId) return response(400, { ok: false, error: 'Missing clientId' }, origin);

      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `GMAIL_TOKEN#${clientId}` });
      const connected = Boolean(item?.tokens?.refresh_token);

      return response(200, { ok: true, connected }, origin);
    } catch (e: any) {
      console.error('google-status error', e);
      return response(500, { ok: false, error: 'Status lookup failed' }, origin);
    }
  }

  return response(404, { ok: false, error: 'Path not found' }, origin);
};