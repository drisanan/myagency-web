import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler } from './common';
import { response } from './cors';
import { queryGSI1 } from '../lib/dynamo';
import { verifyAccessCode } from '../lib/auth';
import { encodeSession, buildSessionCookie } from '../lib/session';

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method !== 'POST') return response(405, { ok: false, error: 'Method not allowed' }, origin);
  if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);

  const { email, accessCode, phone } = JSON.parse(event.body || '{}');
  if (!email || !accessCode || !phone) return response(400, { ok: false, error: 'email, accessCode, phone are required' }, origin);

  // Query by email via GSI1 (GSI1PK = EMAIL#email)
  const matches = await queryGSI1(`EMAIL#${email}`, 'CLIENT#');
  const client = (matches || []).find((i: any) => i.email === email && i.accessCodeHash);
  if (!client) return response(401, { ok: false, error: 'Invalid credentials' }, origin);

  const phoneMatch = (client.phone || '').trim() === String(phone).trim();
  const codeOk = client.accessCodeHash ? await verifyAccessCode(accessCode, client.accessCodeHash) : false;
  if (!phoneMatch || !codeOk) return response(401, { ok: false, error: 'Invalid credentials' }, origin);

  const token = encodeSession({
    agencyId: client.agencyId,
    agencyEmail: client.agencyEmail,
    role: 'client',
    clientId: client.id,
  });

  const headers = {
    'Set-Cookie': buildSessionCookie(token),
  };

  return response(200, { ok: true }, origin, headers);
};

