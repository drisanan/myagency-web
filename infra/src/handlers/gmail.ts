import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, badRequest, ok } from './common';
import { buildOAuthUrl, exchangeCode } from '../lib/google';
import { getSession } from './common';
import { putItem, getItem } from '../lib/dynamo';
import { GmailTokenRecord } from '../lib/models';
import { google } from 'googleapis';

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const method = event.requestContext.http?.method?.toUpperCase();
  if (!method) return badRequest('Missing method');

  const action = event.pathParameters?.action;
  if (!action) return badRequest('Missing action');

  if (method === 'POST') {
    if (action === 'oauth-url') {
      try {
        const url = buildOAuthUrl(['https://www.googleapis.com/auth/gmail.compose']);
        return ok({ ok: true, url });
      } catch (e: any) {
        return badRequest(e?.message || 'Failed to build OAuth URL');
      }
    }
    if (action === 'oauth-callback') {
      const code = event.queryStringParameters?.code;
      if (!code) return badRequest('Missing code');
      try {
        const tokens = await exchangeCode(code);
        const session = getSession(event);
        if (!session?.agencyId) return badRequest('Missing session');
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
        return ok({ ok: true });
      } catch (e: any) {
        return badRequest(e?.message || 'OAuth exchange failed');
      }
    }
    if (action === 'create-draft') {
      const session = getSession(event);
      if (!session?.agencyId) return badRequest('Missing session');
      if (!event.body) return badRequest('Missing body');
      const payload = JSON.parse(event.body);
      const { clientId, recipients, subject, html } = payload || {};
      if (!clientId || !Array.isArray(recipients) || !recipients.length || !subject || !html) {
        return badRequest('clientId, recipients[], subject, html required');
      }
      const tokenRec = await getItem({ PK: `CLIENT#${clientId}`, SK: `TOKEN#${session.agencyId}` });
      if (!tokenRec?.tokens) return badRequest('No Gmail tokens stored for client');
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
      return ok({ ok: true, created, results });
    }
  }

  return badRequest(`Unsupported method/action ${method} ${action}`);
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

