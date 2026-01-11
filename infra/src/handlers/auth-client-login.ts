import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler } from './common';
import { response } from './cors';
import { queryGSI1, scanByGSI1PK, getItem } from '../lib/dynamo';
import { encodeSession, buildSessionCookie } from '../lib/session';
import { verifyAccessCode } from '../lib/auth';
import { withSentry } from '../lib/sentry';

function mask(value?: string) {
  if (!value) return '';
  const s = String(value);
  if (s.length <= 4) return '****';
  return `${'*'.repeat(Math.max(0, s.length - 4))}${s.slice(-4)}`;
}

function normalizeEmail(email: string) {
  return String(email || '').trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return String(phone || '').trim();
}

const authClientLoginHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  // Detect localhost for cookie settings (production requests never contain 'localhost')
  const host = headers['x-forwarded-host'] || headers.host || headers.Host || '';
  const proto = headers['x-forwarded-proto'] || 'https';
  const resolvedOrigin = origin || `${proto}://${host}`;
  const isLocal = resolvedOrigin.includes('localhost');
  const secureCookie = proto === 'https' && !isLocal;
  
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method !== 'POST') return response(405, { ok: false, error: 'Method not allowed' }, origin);
  if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);

  const { email, accessCode, phone } = JSON.parse(event.body || '{}');
  // NOTE: Full phone and access length logged for debugging (test data). Remove/mask in production hardening.
  console.log('[auth-client-login] request', {
    email,
    phone: String(phone),
    accessLen: accessCode ? String(accessCode).length : 0,
  });
  if (!email || !accessCode || !phone) return response(400, { ok: false, error: 'email, accessCode, phone are required' }, origin);

  const normalizedEmail = normalizeEmail(email);
  const accessString = String(accessCode).trim();
  const phoneString = normalizePhone(phone);

  // Query by email via GSI1 (GSI1PK = EMAIL#email)
  let matches = await queryGSI1(`EMAIL#${normalizedEmail}`, 'CLIENT#');
  console.log('[auth-client-login] matches (GSI1)', matches?.length || 0);
  if (!matches || matches.length === 0) {
    // Fallback: scan by GSI1PK in case the index is missing/misconfigured
    matches = await scanByGSI1PK(`EMAIL#${normalizedEmail}`, 'CLIENT#');
    console.log('[auth-client-login] matches (fallback scan)', matches?.length || 0);
  }
  const client = (matches || []).find((i: any) => normalizeEmail(i.email) === normalizedEmail && (i.accessCodeHash || i.accessCode));
  if (!client) {
    console.warn('[auth-client-login] no client/accessCodeHash', { email: normalizedEmail });
    return response(401, { ok: false, error: 'Invalid credentials' }, origin);
  }

  const phoneMatch = normalizePhone(client.phone) === phoneString;
  let codeOk = false;
  if ((client as any).accessCodeHash) {
    codeOk = await verifyAccessCode(accessString, (client as any).accessCodeHash);
  } else if ((client as any).accessCode) {
    codeOk = accessString === String((client as any).accessCode).trim();
  }
  console.log('[auth-client-login] validation', {
    email: normalizedEmail,
    phoneMatch,
    codeOk,
    hasHash: Boolean((client as any).accessCodeHash),
    hasAccess: Boolean((client as any).accessCode),
  });
  if (!phoneMatch || !codeOk) return response(401, { ok: false, error: 'Invalid credentials' }, origin);

  // Fetch agency settings for white-label branding
  let agencyLogo: string | undefined;
  let agencySettings: { primaryColor?: string; secondaryColor?: string } | undefined;
  
  if (client.agencyId) {
    try {
      const agency = await getItem({ PK: `AGENCY#${client.agencyId}`, SK: 'PROFILE' });
      if (agency) {
        agencyLogo = (agency as any).settings?.logoDataUrl || (agency as any).logoUrl;
        agencySettings = {
          primaryColor: (agency as any).settings?.primaryColor,
          secondaryColor: (agency as any).settings?.secondaryColor,
        };
      }
    } catch (e) {
      console.warn('[auth-client-login] Failed to fetch agency settings', e);
    }
  }

  const token = encodeSession({
    agencyId: client.agencyId,
    agencyEmail: client.agencyEmail,
    role: 'client',
    clientId: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    agencyLogo,
    agencySettings,
  });

  const cookieHeader = {
    'Set-Cookie': buildSessionCookie(token, secureCookie, isLocal),
  };

  return response(200, { ok: true }, origin, cookieHeader);
};

export const handler = withSentry(authClientLoginHandler);

