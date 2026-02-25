import { google } from 'googleapis';
import { getItem, putItem } from './dynamo';
import { GmailTokenRecord } from './models';
import { buildOAuthClient } from './google';

type SendGmailInput = {
  agencyId: string;
  senderClientId: string;
  to: string;
  subject: string;
  html: string;
};

function buildMime(subject: string, html: string, to: string) {
  const lines = [];
  lines.push('MIME-Version: 1.0');
  lines.push('From: me');
  lines.push(`To: ${to}`);
  lines.push(`Subject: ${subject}`);
  lines.push('Content-Type: text/html; charset="UTF-8"');
  lines.push('Content-Transfer-Encoding: base64');
  lines.push('');
  lines.push(Buffer.from(html).toString('base64'));
  return Buffer.from(lines.join('\r\n')).toString('base64url');
}

async function loadTokens(agencyId: string, senderClientId: string) {
  const tokenRec = await getItem({
    PK: `AGENCY#${agencyId}`,
    SK: `GMAIL_TOKEN#${senderClientId}`,
  }) as GmailTokenRecord | undefined;
  return tokenRec;
}

export async function sendGmailMessage(input: SendGmailInput) {
  const tokenRec = await loadTokens(input.agencyId, input.senderClientId);
  if (!tokenRec?.tokens) {
    throw new Error('No Gmail tokens available for sender');
  }

  let tokens = tokenRec.tokens;
  const oauth2Client = buildOAuthClient();
  oauth2Client.setCredentials(tokens);

  const isExpired = tokens.expiry_date && Date.now() > tokens.expiry_date;
  if (isExpired && tokens.refresh_token) {
    const { credentials } = await oauth2Client.refreshAccessToken();
    const mergedTokens = { ...tokens, ...credentials };
    tokens = mergedTokens;
    oauth2Client.setCredentials(mergedTokens);
    await putItem({
      ...tokenRec,
      tokens: mergedTokens,
      updatedAt: Date.now(),
    });
  }

  if (process.env.MOCK_GMAIL === 'true') {
    return { ok: true, mocked: true };
  }

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const raw = buildMime(input.subject, input.html, input.to);
  const res = await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });

  return { ok: true, id: res.data.id };
}
