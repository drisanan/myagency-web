import { NextRequest, NextResponse } from 'next/server';
import { getTokens, saveTokens } from '../../google/tokenStore';
import { toBase64Url } from '../utils';

// Server-side routes should prefer API_BASE_URL (full URL) over NEXT_PUBLIC_ (may be a relative proxy path)
const API_BASE_URL = process.env.API_BASE_URL || process.env.NEXT_PUBLIC_API_BASE_URL || '';

async function fetchTokensFromBackend(clientId: string, cookies: string): Promise<any> {
  if (!API_BASE_URL) return null;

  try {
    const url = `${API_BASE_URL.startsWith('http') ? API_BASE_URL : `https://${API_BASE_URL}`}/google/tokens?clientId=${encodeURIComponent(clientId)}`;
    const res = await fetch(url, {
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    });

    if (!res.ok) {
      console.warn('[gmail-send:backend-tokens] Failed to fetch:', res.status);
      return null;
    }

    const data = await res.json();
    if (data?.tokens) {
      saveTokens(clientId, data.tokens);
      return data.tokens;
    }
    return null;
  } catch (e) {
    console.error('[gmail-send:backend-tokens] Error:', e);
    return null;
  }
}

async function refreshTokensFromBackend(clientId: string, cookies: string): Promise<any> {
  if (!API_BASE_URL) return null;

  try {
    const url = `${API_BASE_URL.startsWith('http') ? API_BASE_URL : `https://${API_BASE_URL}`}/google/refresh`;
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Cookie': cookies,
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify({ clientId }),
    });

    if (!res.ok) {
      console.warn('[gmail-send:refresh] Failed:', res.status);
      return null;
    }

    const data = await res.json();
    if (data?.ok) {
      return await fetchTokensFromBackend(clientId, cookies);
    }
    return null;
  } catch (e) {
    console.error('[gmail-send:refresh] Error:', e);
    return null;
  }
}

function stripMailto(s: string): string {
  let out = s.trim();
  if (out.toLowerCase().startsWith('mailto:')) {
    out = out.slice(7);
  }
  const q = out.indexOf('?');
  if (q >= 0) out = out.slice(0, q);
  return out.trim();
}

function extractAngleBracketEmails(s: string): string[] {
  const out: string[] = [];
  const regex = /<([^<>\s@]+@[^<>\s@]+\.[^<>\s@]+)>/g;
  let m: RegExpExecArray | null;
  while ((m = regex.exec(s)) !== null) {
    out.push(m[1]);
  }
  return out;
}

function splitEmails(input: string): string[] {
  return input
    .split(/[,\s;]+/g)
    .map((s) => s.trim())
    .filter(Boolean);
}

function isValidEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) && !/[\r\n]/.test(s);
}

export async function POST(req: NextRequest) {
  try {
    const { clientId, to, recipients, cc, subject, html, tokens: inlineTokens, agencyEmail, trackingId } = (await req.json()) as {
      clientId: string;
      to?: string[];
      recipients?: string[];
      cc?: string[];
      subject: string;
      html: string;
      tokens?: any;
      agencyEmail?: string;
      trackingId?: string;
    };

    const toList = (to && to.length ? to : recipients) || [];

    console.info('[gmail-send:start]', {
      clientId,
      toCount: toList?.length || 0,
      subjectLength: subject?.length || 0,
      hasInlineTokens: Boolean(inlineTokens),
    });

    if (!clientId) return NextResponse.json({ ok: false, error: 'Missing clientId' }, { status: 400 });
    if (!toList?.length) return NextResponse.json({ ok: false, error: 'Missing recipients' }, { status: 400 });

    const candidates: string[] = [];
    (toList || []).forEach((raw) => {
      if (typeof raw !== 'string') return;
      const angled = extractAngleBracketEmails(raw);
      if (angled.length) {
        angled.forEach((e) => candidates.push(e));
        return;
      }
      splitEmails(raw).forEach((tok) => {
        const cleaned = stripMailto(tok.replace(/^["'()]+|["'()]+$/g, ''));
        if (cleaned) candidates.push(cleaned);
      });
    });
    const validRecipients = Array.from(new Set(candidates.filter(isValidEmail)));
    console.info('[gmail-send:recipients]', {
      clientId,
      requested: toList?.length || 0,
      candidates: candidates.length,
      valid: validRecipients.length,
    });
    if (!validRecipients.length) {
      return NextResponse.json({ ok: false, error: 'No valid recipient emails' }, { status: 400 });
    }

    const ccCandidates: string[] = [];
    (cc || []).forEach((raw) => {
      if (typeof raw !== 'string') return;
      const angled = extractAngleBracketEmails(raw);
      if (angled.length) {
        angled.forEach((e) => ccCandidates.push(e));
        return;
      }
      splitEmails(raw).forEach((tok) => {
        const cleaned = stripMailto(tok.replace(/^["'()]+|["'()]+$/g, ''));
        if (cleaned) ccCandidates.push(cleaned);
      });
    });
    const validCcRecipients = Array.from(new Set(ccCandidates.filter(isValidEmail)));
    if (validCcRecipients.length > 0) {
      console.info('[gmail-send:cc-recipients]', {
        clientId,
        requested: cc?.length || 0,
        valid: validCcRecipients.length,
      });
    }

    const cookies = req.headers.get('cookie') || '';
    let tokens = inlineTokens || getTokens(clientId);
    if (!tokens?.access_token && !tokens?.refresh_token) {
      console.info('[gmail-send:fetching-from-backend]', { clientId });
      tokens = await fetchTokensFromBackend(clientId, cookies);
    }

    console.info('[gmail-send:tokens]', {
      clientId,
      inline: Boolean(inlineTokens),
      exists: Boolean(tokens),
      hasAccess: Boolean(tokens?.access_token),
      hasRefresh: Boolean(tokens?.refresh_token),
      expiry: tokens?.expiry_date,
    });

    if (!tokens?.refresh_token && !tokens?.access_token) {
      console.warn('[gmail-send:unauthorized]', { clientId });
      return NextResponse.json({ ok: false, error: 'Gmail not connected for this client. Please reconnect Gmail.' }, { status: 401 });
    }

    const isExpired = tokens?.expiry_date && Date.now() > tokens.expiry_date;
    if (isExpired && tokens?.refresh_token) {
      console.info('[gmail-send:refreshing-expired-token]', { clientId, expiry: tokens.expiry_date });
      const refreshedTokens = await refreshTokensFromBackend(clientId, cookies);
      if (refreshedTokens) {
        tokens = refreshedTokens;
        console.info('[gmail-send:token-refreshed]', { clientId, newExpiry: tokens?.expiry_date });
      } else {
        console.warn('[gmail-send:refresh-failed]', { clientId });
      }
    }

    const { google } = await import('googleapis');
    const metrics = await import('../../metrics/store');
    const oAuth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
    oAuth2Client.setCredentials(tokens);

    const gmail = google.gmail({ version: 'v1', auth: oAuth2Client });

    const encodedSubjectHeader = subject
      ? `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`
      : 'Subject: ';
    const toHeader = validRecipients.join(', ');

    const tid = trackingId || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    let htmlBody = html || '';
    if (agencyEmail) {
      const pixel = `<img src="/api/metrics/open?tid=${encodeURIComponent(tid)}&agency=${encodeURIComponent(agencyEmail)}" alt="" width="1" height="1" style="display:none;" />`;
      if (/<\/body>/i.test(htmlBody)) {
        htmlBody = htmlBody.replace(/<\/body>/i, `${pixel}</body>`);
      } else {
        htmlBody = `${htmlBody}${pixel}`;
      }
      htmlBody = htmlBody.replace(/href\s*=\s*"(https?:[^"\s]+)"/gi, (_m, url) => {
        const wrapped = `/api/metrics/click?tid=${encodeURIComponent(tid)}&agency=${encodeURIComponent(agencyEmail)}&u=${encodeURIComponent(url)}`;
        return `href="${wrapped}"`;
      });
      try {
        metrics.recordSend(agencyEmail, metrics.todayISO(), validRecipients.length);
      } catch {}
    }

    const emailHeaders = [`To: ${toHeader}`];
    if (validCcRecipients.length > 0) {
      emailHeaders.push(`Cc: ${validCcRecipients.join(', ')}`);
    }
    const raw = [
      ...emailHeaders,
      encodedSubjectHeader,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlBody,
    ].join('\r\n');

    const encoded = toBase64Url(raw);
    const sent = await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encoded },
    });

    console.info('[gmail-send:success]', { clientId, messageId: sent.data.id });
    return NextResponse.json({ ok: true, id: sent.data.id, trackingId: tid });
  } catch (e: any) {
    const detail =
      e?.response?.data?.error?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'Failed to send email';
    console.error('[gmail-send:error]', { detail });
    return NextResponse.json({ ok: false, error: detail }, { status: 500 });
  }
}
