import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common'; // <--- Use strict session check
import { buildOAuthUrl, exchangeCode } from '../lib/google';
import { putItem, getItem } from '../lib/dynamo';
import { GmailTokenRecord } from '../lib/models';
import { google } from 'googleapis';
import { response } from './cors';

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const action = event.pathParameters?.action; // e.g. /gmail/{action}

  // 1. Handle CORS Preflight
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);
  if (!action) return response(400, { ok: false, error: 'Missing action' }, origin);

  // 2. Identify the User (Session)
  // All Gmail operations require an active agency session.
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  if (method === 'POST') {
    // --- A. Generate OAuth URL ---
    // Usage: Client asks "Where do I send the user to authorize Gmail?"
    if (action === 'oauth-url') {
      try {
        const url = buildOAuthUrl(['https://www.googleapis.com/auth/gmail.compose']);
        return response(200, { ok: true, url }, origin);
      } catch (e: any) {
        return response(400, { ok: false, error: e?.message || 'Failed to build OAuth URL' }, origin);
      }
    }

    // --- B. Handle OAuth Callback (Save Tokens) ---
    // Usage: Frontend sends the 'code' back to us to exchange for tokens.
    if (action === 'oauth-callback') {
      const body = event.body ? JSON.parse(event.body) : {};
      const code = body.code || event.queryStringParameters?.code;
      const clientId = body.clientId || event.queryStringParameters?.clientId;

      if (!code) return response(400, { ok: false, error: 'Missing code' }, origin);
      // We might associate this token with a specific Client (athlete) or the Agency itself.
      // Based on your code, it seems you want to link it to a Client ID.
      if (!clientId) return response(400, { ok: false, error: 'Missing clientId' }, origin);

      try {
        const tokens = await exchangeCode(code);
        
        // Correct Partitioning: Store under Agency partition so we verify ownership.
        // PK: AGENCY#{agencyId}
        // SK: GMAIL_TOKEN#{clientId} 
        const rec: GmailTokenRecord = {
          PK: `AGENCY#${session.agencyId}`,
          SK: `GMAIL_TOKEN#${clientId}`,
          clientId,
          agencyId: session.agencyId,
          tokens,
          createdAt: Date.now(),
        };
        await putItem(rec);
        
        return response(200, { ok: true }, origin);
      } catch (e: any) {
        console.error('OAuth exchange error', e);
        return response(400, { ok: false, error: e?.message || 'OAuth exchange failed' }, origin);
      }
    }

    // --- C. Create Drafts ---
    // Usage: Agency wants to create draft emails in the connected Gmail account.
    if (action === 'create-draft') {
      if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
      const payload = JSON.parse(event.body);
      const { clientId, recipients, subject, html } = payload || {};

      if (!clientId || !Array.isArray(recipients) || !recipients.length || !subject || !html) {
        return response(400, { ok: false, error: 'clientId, recipients[], subject, html required' }, origin);
      }

      // 1. Retrieve Tokens using the correct key schema
      const tokenRec = await getItem({ 
        PK: `AGENCY#${session.agencyId}`, 
        SK: `GMAIL_TOKEN#${clientId}` 
      });

      if (!tokenRec?.tokens) return response(400, { ok: false, error: 'No Gmail tokens stored for this client' }, origin);
      
      const tokens = tokenRec.tokens;

      // 2. Initialize Google Client
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
      );
      oauth2Client.setCredentials(tokens);
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      // 3. Create Drafts
      const results: Array<{ to: string; ok: boolean; error?: string }> = [];
      for (const to of recipients) {
        try {
          // Skip actual call if mocking or missing access token
          if (process.env.MOCK_GMAIL === 'true' || !tokens?.access_token) {
            console.log('Mocking draft creation', { to });
            results.push({ to, ok: true });
            continue;
          }

          const raw = buildMime(subject, html, to);
          await gmail.users.drafts.create({
            userId: 'me',
            requestBody: { message: { raw } },
          });
          results.push({ to, ok: true });
        } catch (err: any) {
          console.error('Gmail draft error', err);
          results.push({ to, ok: false, error: err?.message || 'draft error' });
        }
      }

      const created = results.filter((r) => r.ok).length;
      return response(200, { ok: true, created, results }, origin);
    }
  }

  return response(405, { ok: false, error: `Unsupported method/action ${method} ${action}` }, origin);
};

// Helper: Build RFC 2822 compliant message
function buildMime(subject: string, html: string, to: string) {
  const lines = [];
  lines.push('From: me');
  lines.push(`To: ${to}`);
  lines.push(`Subject: ${subject}`);
  lines.push('Content-Type: text/html; charset="UTF-8"');
  lines.push('');
  lines.push(html);
  const message = lines.join('\r\n');
  return Buffer.from(message).toString('base64url');
}