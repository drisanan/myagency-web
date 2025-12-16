import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler } from './common';
import { sign, verify } from '../lib/formsToken';
import { newId } from '../lib/ids';
import { getItem, putItem, queryByPK, queryGSI1 } from '../lib/dynamo';

function corsResponse(statusCode: number, body: unknown, origin: string) {
  return {
    statusCode,
    headers: {
      'content-type': 'application/json',
      'access-control-allow-origin': origin || '*',
      'access-control-allow-credentials': 'true',
      'access-control-allow-headers': 'Content-Type,Authorization',
      'access-control-allow-methods': 'GET,POST,OPTIONS',
    },
    body: JSON.stringify(body),
  };
}

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const method = event.requestContext.http?.method?.toUpperCase();
  const path = event.requestContext.http?.path || '';
  const originHdr = event.headers['origin'] || event.headers['Origin'] || '';
  const host = event.headers['x-forwarded-host'] || event.headers['Host'] || '';
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const resolvedOrigin = originHdr || `${proto}://${host}`;
  if (!method) return badRequest('Missing method');

  if (method === 'OPTIONS') {
    return corsResponse(200, { ok: true }, resolvedOrigin);
  }

  // POST /forms/issue
  if (method === 'POST' && path.endsWith('/forms/issue')) {
    if (!event.body) return badRequest('Missing body');
    const { agencyEmail } = JSON.parse(event.body);
    if (!agencyEmail) return badRequest('Missing agencyEmail');
    const payload = {
      agencyEmail,
      iat: Date.now(),
      exp: Date.now() + 1000 * 60 * 60 * 24 * 30,
    };
    const token = sign(payload);
    const url = `${resolvedOrigin}/forms/${token}`;
    return corsResponse(200, { ok: true, token, url }, resolvedOrigin);
  }

  // GET /forms/agency
  if (method === 'GET' && path.endsWith('/forms/agency')) {
    const token = (event.queryStringParameters?.token || '').trim();
    const payload = verify<{ agencyEmail: string; exp?: number }>(token);
    if (!payload?.agencyEmail) return corsResponse(400, { ok: false, error: 'Invalid token' }, resolvedOrigin);
    const byEmail = await queryGSI1(`EMAIL#${payload.agencyEmail}`, 'AGENCY#');
    const agency = (byEmail || [])[0];
    if (!agency) return corsResponse(404, { ok: false, error: 'Agency not found' }, resolvedOrigin);
    return corsResponse(200, {
      ok: true,
      agency: {
        name: agency.name,
        email: agency.email,
        settings: agency.settings || {},
      },
    }, resolvedOrigin);
  }

  // POST /forms/submit
  if (method === 'POST' && path.endsWith('/forms/submit')) {
    if (!event.body) return corsResponse(400, { ok: false, error: 'Missing body' }, resolvedOrigin);
    const body = JSON.parse(event.body || '{}');
    const token = (body.token || '').trim();
    const form = body.form || {};
    const payload = verify<{ agencyEmail: string; exp?: number }>(token);
    if (!payload?.agencyEmail) return corsResponse(400, { ok: false, error: 'Invalid token' }, resolvedOrigin);
    const safeForm = form || {};
    const id = newId('form');
    const rec = {
      PK: `AGENCY#${payload.agencyEmail}`,
      SK: `FORM#${id}`,
      id,
      createdAt: Date.now(),
      consumed: false,
      agencyEmail: payload.agencyEmail,
      data: {
        email: safeForm.email || '',
        phone: safeForm.phone || '',
        password: safeForm.password || '',
        firstName: safeForm.firstName || '',
        lastName: safeForm.lastName || '',
        sport: safeForm.sport || '',
        division: safeForm.division || '',
        graduationYear: safeForm.graduationYear || '',
        profileImageUrl: safeForm.profileImageUrl || '',
        radar: safeForm.radar || {},
      },
    };
    await putItem(rec);
    return corsResponse(200, { ok: true, id }, resolvedOrigin);
  }

  // GET /forms/submissions
  if (method === 'GET' && path.endsWith('/forms/submissions')) {
    const agencyEmail = (event.queryStringParameters?.agencyEmail || '').trim();
    if (!agencyEmail) return corsResponse(400, { ok: false, error: 'Missing agencyEmail' }, resolvedOrigin);
    const items = await queryByPK(`AGENCY#${agencyEmail}`, 'FORM#');
    const pending = (items || []).filter((i: any) => !i.consumed);
    return corsResponse(200, { ok: true, items: pending }, resolvedOrigin);
  }

  // POST /forms/consume
  if (method === 'POST' && path.endsWith('/forms/consume')) {
    if (!event.body) return corsResponse(400, { ok: false, error: 'Missing body' }, resolvedOrigin);
    const { agencyEmail, ids } = JSON.parse(event.body || '{}');
    if (!agencyEmail || !Array.isArray(ids)) return corsResponse(400, { ok: false, error: 'Missing parameters' }, resolvedOrigin);
    for (const id of ids) {
      const item = await getItem({ PK: `AGENCY#${agencyEmail}`, SK: `FORM#${id}` });
      if (item) await putItem({ ...item, consumed: true });
    }
    return corsResponse(200, { ok: true }, resolvedOrigin);
  }

  return corsResponse(400, { ok: false, message: `Unsupported path ${path}` }, resolvedOrigin);
};


