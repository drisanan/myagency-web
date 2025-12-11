import { NextRequest, NextResponse } from 'next/server';
import { getTokens } from '../../google/tokenStore';
import { toBase64Url } from '../utils';

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
    const { clientId, to, subject, html, tokens: inlineTokens, agencyEmail, trackingId } = (await req.json()) as {
      clientId: string;
      to: string[];
      subject: string;
      html: string;
      tokens?: any;
      agencyEmail?: string;
      trackingId?: string;
    };

    console.info('[gmail-draft:start]', {
      clientId,
      toCount: to?.length || 0,
      subjectLength: subject?.length || 0,
      hasInlineTokens: Boolean(inlineTokens),
    });

    if (!clientId) return NextResponse.json({ ok: false, error: 'Missing clientId' }, { status: 400 });
    if (!to?.length) return NextResponse.json({ ok: false, error: 'Missing recipients' }, { status: 400 });

    const candidates: string[] = [];
    (to || []).forEach((raw) => {
      if (typeof raw !== 'string') return;
      // Prefer angle-bracket extraction if present: "Name <email@domain>"
      const angled = extractAngleBracketEmails(raw);
      if (angled.length) {
        angled.forEach((e) => candidates.push(e));
        return;
      }
      // Otherwise split on separators and strip mailto/query and quotes
      splitEmails(raw).forEach((tok) => {
        const cleaned = stripMailto(tok.replace(/^["'()]+|["'()]+$/g, ''));
        if (cleaned) candidates.push(cleaned);
      });
    });
    const validRecipients = Array.from(new Set(candidates.filter(isValidEmail)));
    console.info('[gmail-draft:recipients]', {
      clientId,
      requested: to?.length || 0,
      candidates: candidates.length,
      valid: validRecipients.length,
    });
    if (!validRecipients.length) {
      return NextResponse.json({ ok: false, error: 'No valid recipient emails' }, { status: 400 });
    }

    const storeTokens = getTokens(clientId);
    const tokens = inlineTokens || storeTokens;
    console.info('[gmail-draft:tokens]', {
      clientId,
      inline: Boolean(inlineTokens),
      exists: Boolean(tokens),
      hasAccess: Boolean(tokens?.access_token),
      hasRefresh: Boolean(tokens?.refresh_token),
    });
    if (!tokens?.refresh_token && !tokens?.access_token) {
      console.warn('[gmail-draft:unauthorized]', { clientId });
      return NextResponse.json({ ok: false, error: 'Gmail not connected for this client' }, { status: 401 });
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

    // RFC 2047 encode subject to safely include unicode in header
    const encodedSubjectHeader = subject
      ? `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`
      : 'Subject: ';
    console.log('[gmail-draft:pre = to-header]', { recipients: validRecipients });
    const toHeader = validRecipients.join(', ');
    console.info('[gmail-draft:to-header]', { toHeader, recipients: validRecipients });

    // Inject tracking pixel and wrap links when agencyEmail provided
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

    const raw = [
      `To: ${toHeader}`,
      encodedSubjectHeader,
      'MIME-Version: 1.0',
      'Content-Type: text/html; charset=utf-8',
      '',
      htmlBody,
    ].join('\r\n');

    const encoded = toBase64Url(raw);
    const draft = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: { message: { raw: encoded } },
    });

    const openUrl = `https://mail.google.com/mail/u/0/#search/${encodeURIComponent(`in:drafts subject:\"${subject}\"`)}`;
    console.info('[gmail-draft:success]', { clientId, draftId: draft.data.id, messageId: draft.data.message?.id });

    // TODO: audit log (agency, impersonatedBy, clientId, to, subject, draftId)
    return NextResponse.json({ ok: true, id: draft.data.id, messageId: draft.data.message?.id, openUrl, trackingId: tid });
  } catch (e: any) {
    const detail =
      e?.response?.data?.error?.message ||
      e?.response?.data?.error ||
      e?.message ||
      'Failed to create draft';
    console.error('[gmail-draft:error]', { detail });
    return NextResponse.json({ ok: false, error: detail }, { status: 500 });
  }
}


