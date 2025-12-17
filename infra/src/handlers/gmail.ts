import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, getSession } from './common';
import { buildOAuthUrl, exchangeCode } from '../lib/google';
import { putItem, getItem } from '../lib/dynamo';
import { GmailTokenRecord } from '../lib/models';
import { google } from 'googleapis';
import { response } from './cors';

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  const action = event.pathParameters?.action;
  if (!action) return response(400, { ok: false, error: 'Missing action' }, origin);

  if (method === 'POST') {
    if (action === 'oauth-url') {
      try {
        const url = buildOAuthUrl(['https://www.googleapis.com/auth/gmail.compose']);
        return response(200, { ok: true, url }, origin);
      } catch (e: any) {
        return response(400, { ok: false, error: e?.message || 'Failed to build OAuth URL' }, origin);
      }
    }
    if (action === 'oauth-callback') {
      const code = event.queryStringParameters?.code;
      if (!code) return response(400, { ok: false, error: 'Missing code' }, origin);
      try {
        const tokens = await exchangeCode(code);
        const session = getSession(event);
        if (!session?.agencyId) return response(401, { ok: false, error: 'Missing session' }, origin);
        const clientId = event.queryStringParameters?.clientId || 'client';
        const rec: GmailTokenRecord = {
          PK: `CLIENT#${clientId}`,
          SK: `TOKEN#${session.agencyId}`,
          clientId,
          agencyId: session.agencyId,
          tokens,
          createdAt: Date.now(),
        };
        await putItem(rec);
        return response(200, { ok: true }, origin);
      } catch (e: any) {
        return response(400, { ok: false, error: e?.message || 'OAuth exchange failed' }, origin);
      }
    }
    if (action === 'create-draft') {
      const session = getSession(event);
      if (!session?.agencyId) return response(401, { ok: false, error: 'Missing session' }, origin);
      if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
      const payload = JSON.parse(event.body);
      const { clientId, recipients, subject, html } = payload || {};
      if (!clientId || !Array.isArray(recipients) || !recipients.length || !subject || !html) {
        return response(400, { ok: false, error: 'clientId, recipients[], subject, html required' }, origin);
      }
      const tokenRec = await getItem({ PK: `CLIENT#${clientId}`, SK: `TOKEN#${session.agencyId}` });
      if (!tokenRec?.tokens) return response(400, { ok: false, error: 'No Gmail tokens stored for client' }, origin);
      const tokens = tokenRec.tokens;
      const oauth2Client = new google.auth.OAuth2(
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.GOOGLE_REDIRECT_URI,
      );
      oauth2Client.setCredentials(tokens);
      const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

      const results: Array<{ to: string; ok: boolean; error?: string }> = [];
      for (const to of recipients) {
        try {
          if (process.env.MOCK_GMAIL === 'true' || !tokens?.access_token) {
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
          results.push({ to, ok: false, error: err?.message || 'draft error' });
        }
      }
      const created = results.filter((r) => r.ok).length;
      return response(200, { ok: true, created, results }, origin);
    }
  }

  return response(405, { ok: false, error: `Unsupported method/action ${method} ${action}` }, origin);
};

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

