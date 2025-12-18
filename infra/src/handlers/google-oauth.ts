import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common'; // <--- Secured
import { buildOAuthUrl, exchangeCode } from '../lib/google';
import { response } from './cors';
import { putItem } from '../lib/dynamo';
import { GmailTokenRecord } from '../lib/models';

const SCOPES = ['https://www.googleapis.com/auth/gmail.compose'];

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  // 1. Identify the User (Session)
  // We require a session for BOTH generating the URL (to know who is asking)
  // and the callback (to know where to store the tokens).
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  // --- GET /google/oauth/url ---
  if (method === 'GET' && event.rawPath?.endsWith('/google/oauth/url')) {
    try {
      const url = buildOAuthUrl(SCOPES);
      return response(200, { ok: true, url }, origin);
    } catch (e: any) {
      return response(400, { ok: false, error: e?.message || 'Failed to build OAuth URL' }, origin);
    }
  }

  // --- GET /google/oauth/callback ---
  if (method === 'GET' && event.rawPath?.endsWith('/google/oauth/callback')) {
    const code = event.queryStringParameters?.code;
    const clientId = event.queryStringParameters?.clientId; // <--- Critical: We need to know WHICH athlete this is for

    if (!code) return response(400, { ok: false, error: 'Missing code' }, origin);
    if (!clientId) return response(400, { ok: false, error: 'Missing clientId' }, origin);

    try {
      // 2. Exchange Code for Tokens
      const tokens = await exchangeCode(code);

      // 3. Persist Tokens in DynamoDB
      // We store this under the AGENCY partition so it is secure and easy to look up.
      const rec: GmailTokenRecord = {
        PK: `AGENCY#${session.agencyId}`,
        SK: `GMAIL_TOKEN#${clientId}`,
        clientId,
        agencyId: session.agencyId,
        tokens, // Contains access_token, refresh_token, expiry, etc.
        createdAt: Date.now(),
      };

      await putItem(rec);
      console.log('Google OAuth tokens stored', { agencyId: session.agencyId, clientId });

      return response(200, { ok: true }, origin);
    } catch (e: any) {
      console.error('OAuth callback error', e);
      return response(400, { ok: false, error: e?.message || 'OAuth exchange failed' }, origin);
    }
  }

  return response(400, { ok: false, error: `Unsupported path ${event.rawPath}` }, origin);
};