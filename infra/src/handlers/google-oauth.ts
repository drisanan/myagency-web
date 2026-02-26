import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { requireSession } from './common';
import { response } from './cors';
import { putItem, getItem, deleteItem, queryGSI1 } from '../lib/dynamo';
import { google } from 'googleapis';
import { withSentry } from '../lib/sentry';
import { verify as verifyFormToken } from '../lib/formsToken';

const API_DOMAIN = 'api.myrecruiteragency.com';
const PROD_REDIRECT_URI = `https://${API_DOMAIN}/google/oauth/callback`;
const PROD_FRONTEND_URL = 'https://www.myrecruiteragency.com';

function safeRedirectUri(): string {
  const uri = process.env.GOOGLE_REDIRECT_URI || PROD_REDIRECT_URI;
  if (uri.includes('localhost') || uri.includes('127.0.0.1')) return PROD_REDIRECT_URI;
  return uri;
}

const REDIRECT_URI = safeRedirectUri();
const FRONTEND_URL = (() => {
  const url = process.env.FRONTEND_URL || PROD_FRONTEND_URL;
  if (url.includes('localhost') || url.includes('127.0.0.1')) return PROD_FRONTEND_URL;
  return url;
})();

const SCOPES = [
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/calendar.readonly',  // Read calendar events
  'https://www.googleapis.com/auth/calendar.events',     // Create/edit calendar events
  'email',
  'openid'
];

const googleOauthHandler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const path = event.rawPath || event.requestContext.http?.path || '';

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  // 1. Identify User (Session or Form Token)
  let session = requireSession(event);

  if (!session) {
    // Try formToken from query params (URL generation flow)
    let formToken = event.queryStringParameters?.formToken;

    // For the callback route, formToken is embedded in the state parameter
    if (!formToken && path.endsWith('/google/oauth/callback')) {
      try {
        const stateRaw = event.queryStringParameters?.state;
        if (stateRaw) {
          const decoded = JSON.parse(Buffer.from(stateRaw, 'base64').toString('utf-8'));
          if (decoded?.formToken) formToken = decoded.formToken;
        }
      } catch { /* state parsing failed, fall through */ }
    }

    if (formToken) {
      const payload = verifyFormToken<{ agencyEmail: string }>(formToken);
      if (payload?.agencyEmail) {
        const agencies = await queryGSI1(`EMAIL#${payload.agencyEmail}`, 'AGENCY#');
        const agency = agencies?.[0];
        if (agency?.id) {
          session = { agencyId: agency.id, agencyEmail: payload.agencyEmail, role: 'client' as const };
        }
      }
    }
  }
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
  // GET /google/oauth/url?clientId=...  OR  ?agentId=...
  // =========================================================================
  if (method === 'GET' && path.endsWith('/google/oauth/url')) {
    const clientId = event.queryStringParameters?.clientId;
    const agentId = event.queryStringParameters?.agentId;
    if (!clientId && !agentId) return response(400, { ok: false, error: 'Missing clientId or agentId parameter' }, origin);

    try {
      const formToken = event.queryStringParameters?.formToken;
      const statePayload = JSON.stringify({
        ...(clientId ? { clientId } : {}),
        ...(agentId ? { agentId } : {}),
        agencyId: session.agencyId,
        ...(formToken ? { formToken } : {}),
      });
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
      const { clientId, agentId, agencyId: stateAgencyId } = decodedState;

      if (!clientId && !agentId) return response(400, { ok: false, error: 'Invalid state' }, origin);

      // Use session agencyId when available, fall back to the agencyId
      // embedded in the state (public form flow where no cookie exists)
      const resolvedAgencyId = session.agencyId || stateAgencyId;
      if (!resolvedAgencyId) return response(400, { ok: false, error: 'Missing agency context' }, origin);

      const { tokens } = await oauth2Client.getToken(code);

      const tokenSK = agentId ? `GMAIL_TOKEN#AGENT-${agentId}` : `GMAIL_TOKEN#${clientId}`;
      const tokenRecord = {
        PK: `AGENCY#${resolvedAgencyId}`,
        SK: tokenSK,
        ...(clientId ? { clientId } : {}),
        ...(agentId ? { agentId } : {}),
        agencyId: resolvedAgencyId,
        tokens, 
        createdAt: Date.now(),
      };

      await putItem(tokenRecord);
      console.log('Tokens saved for', agentId ? `agent: ${agentId}` : `client: ${clientId}`);

      const successPayload = { type: 'google-oauth-success', clientId, agentId, tokens };

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
  // GET /google/status?clientId=...  OR  ?agentId=...
  // =========================================================================
  if (method === 'GET' && path.endsWith('/google/status')) {
    try {
      const clientId = event.queryStringParameters?.clientId;
      const agentId = event.queryStringParameters?.agentId;
      if (!clientId && !agentId) return response(400, { ok: false, error: 'Missing clientId or agentId' }, origin);

      const tokenSK = agentId ? `GMAIL_TOKEN#AGENT-${agentId}` : `GMAIL_TOKEN#${clientId}`;
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: tokenSK });
      
      const hasTokens = Boolean(item?.tokens);
      const hasRefreshToken = Boolean(item?.tokens?.refresh_token);
      const expiryDate = item?.tokens?.expiry_date;
      const isExpired = expiryDate ? Date.now() > expiryDate : !hasTokens;

      let email: string | undefined;
      if (hasTokens) {
        try {
          const oauth = new google.auth.OAuth2(
            process.env.GOOGLE_CLIENT_ID,
            process.env.GOOGLE_CLIENT_SECRET,
            REDIRECT_URI,
          );
          oauth.setCredentials(item?.tokens);
          const oauth2 = google.oauth2({ version: 'v2', auth: oauth });
          const profile = await oauth2.userinfo.get();
          email = profile?.data?.email || undefined;
        } catch (e) {
          console.warn('[google/status] Failed to fetch user email', e);
        }
      }
      return response(200, {
        ok: true,
        connected: hasTokens && hasRefreshToken,
        expired: hasTokens && isExpired,
        canRefresh: hasRefreshToken,
        expiryDate,
        email,
      }, origin);
    } catch (e: any) {
      console.error('google-status error', e);
      return response(500, { ok: false, error: 'Status lookup failed' }, origin);
    }
  }

  // =========================================================================
  // ROUTE: Force Token Refresh
  // POST /google/refresh
  // =========================================================================
  if (method === 'POST' && path.endsWith('/google/refresh')) {
    const body = JSON.parse(event.body || '{}');
    const clientId = body.clientId;
    if (!clientId) return response(400, { ok: false, error: 'Missing clientId' }, origin);

    const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `GMAIL_TOKEN#${clientId}` });
    if (!item?.tokens?.refresh_token) {
      return response(400, { ok: false, error: 'No refresh token available - reconnection required' }, origin);
    }

    try {
      oauth2Client.setCredentials(item.tokens);
      const { credentials } = await oauth2Client.refreshAccessToken();
      
      // Merge so the stored refresh_token is preserved when Google omits it
      const mergedTokens = { ...item.tokens, ...credentials };
      await putItem({
        ...item,
        tokens: mergedTokens,
        updatedAt: Date.now(),
      });

      console.log('Token refreshed for client:', clientId);
      return response(200, { ok: true, expiryDate: credentials.expiry_date }, origin);
    } catch (e: any) {
      console.error('Token refresh failed', e);
      return response(400, { ok: false, error: 'Refresh failed - reconnection required' }, origin);
    }
  }

  // =========================================================================
  // ROUTE: Disconnect Google Account (Revoke tokens + delete from DB)
  // DELETE /google/disconnect?clientId=...
  // =========================================================================
  if (method === 'DELETE' && path.endsWith('/google/disconnect')) {
    const clientId = event.queryStringParameters?.clientId;
    if (!clientId) return response(400, { ok: false, error: 'Missing clientId' }, origin);

    const tokenKey = { PK: `AGENCY#${session.agencyId}`, SK: `GMAIL_TOKEN#${clientId}` };

    try {
      // Attempt to revoke the token on Google's side (best-effort)
      const item = await getItem(tokenKey);
      if (item?.tokens?.access_token) {
        try {
          oauth2Client.setCredentials(item.tokens);
          await oauth2Client.revokeToken(item.tokens.access_token);
          console.log('Google token revoked for client:', clientId);
        } catch (revokeErr: any) {
          // Token may already be invalid/revoked — that's fine
          console.warn('Token revocation failed (may already be revoked):', revokeErr?.message);
        }
      }

      // Delete the token record from DynamoDB
      await deleteItem(tokenKey);
      console.log('Google tokens deleted for client:', clientId);

      return response(200, { ok: true, message: 'Google account disconnected' }, origin);
    } catch (e: any) {
      console.error('Disconnect error', e);
      return response(500, { ok: false, error: e?.message || 'Failed to disconnect' }, origin);
    }
  }

  return response(404, { ok: false, error: 'Path not found' }, origin);
};

export const handler = withSentry(googleOauthHandler);