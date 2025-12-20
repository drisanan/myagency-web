import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { requireSession } from './common';
import { response } from './cors';
import { putItem } from '../lib/dynamo';
import { google } from 'googleapis';

// FIX: Hardcode the domain logic so it never fails even if env var is missing
const API_DOMAIN = 'api.myrecruiteragency.com';
const REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI || `https://${API_DOMAIN}/google/oauth/callback`;

// Scopes required for Gmail Drafts
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

  // Ensure Client ID/Secret are present
  if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET) {
    console.error('Missing Google Credentials in Env');
    return response(500, { ok: false, error: 'Server configuration error' }, origin);
  }

  // initialize OAuth client
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    REDIRECT_URI // <--- Using the guaranteed variable
  );

  // =========================================================================
  // ROUTE: Generate Login URL
  // GET /google/oauth/url?clientId=...
  // =========================================================================
  if (method === 'GET' && path.endsWith('/google/oauth/url')) {
    const clientId = event.queryStringParameters?.clientId;
    if (!clientId) return response(400, { ok: false, error: 'Missing clientId parameter' }, origin);

    try {
      // Encode clientId into 'state' so we know who this token belongs to when Google calls us back
      const statePayload = JSON.stringify({ clientId, agencyId: session.agencyId });
      const state = Buffer.from(statePayload).toString('base64');

      const url = oauth2Client.generateAuthUrl({
        access_type: 'offline', // Critical for getting a refresh_token
        scope: SCOPES,
        state: state,
        prompt: 'consent', // Force consent screen to ensure refresh_token is returned
        include_granted_scopes: true
      });

      console.log('Generated Google OAuth URL:', { url, redirectUri: REDIRECT_URI });
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

    // Handle Google errors (e.g. user clicked Cancel)
    if (error) {
       return {
         statusCode: 200,
         headers: { 'Content-Type': 'text/html' },
         body: `<script>window.close();</script>` 
       };
    }

    if (!code || !state) return response(400, { ok: false, error: 'Missing code or state' }, origin);

    try {
      // 1. Decode 'state' to recover clientId
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      const { clientId } = decodedState;

      if (!clientId) return response(400, { ok: false, error: 'Invalid state' }, origin);

      // 2. Exchange Code for Tokens
      // We use the same oauth2Client instance which has the correct REDIRECT_URI set
      const { tokens } = await oauth2Client.getToken(code);

      // 3. Persist Tokens to DynamoDB
      const pk = `AGENCY#${session.agencyId}`;
      const sk = `CLIENT#${clientId}`;

      // We update the existing CLIENT record with the tokens
      // Note: We use putItem in your Dynamo lib, typically this overwrites. 
      // Ideally you use updateItem, but here we will construct the token fields to merge.
      // Since we don't have the full client object here, we assume your 'putItem' or 'updateItem' logic handles this.
      // Based on previous turns, you had a 'updateItem' or 'putItem'. 
      // To be safe and "drop-in" compatible with your lib/models structure:
      
      // We will create a specific GMAIL_TOKEN record (as seen in your snippet) 
      // OR update the main client record. 
      // *Your snippet used GMAIL_TOKEN#... so we stick to that pattern for safety.*
      
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

      // 4. Return HTML that communicates success to the opening window (the React app)
      const successPayload = {
        type: 'google-oauth-success',
        clientId,
        tokens
      };
      
      const FRONTEND_URL = process.env.FRONTEND_URL || 'https://www.myrecruiteragency.com';

      return {
        statusCode: 200,
        headers: { 'Content-Type': 'text/html' },
        body: `
          <html><body>
          <script>
            // Send success message to the main window
            if (window.opener) {
              window.opener.postMessage(${JSON.stringify(successPayload)}, '${FRONTEND_URL}');
              window.opener.postMessage(${JSON.stringify(successPayload)}, 'http://localhost:3000'); // Fallback for dev
            }
            // Close this popup
            window.close();
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

  return response(404, { ok: false, error: 'Path not found' }, origin);
};