import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors';
import { newId } from '../lib/ids';
import { putItem, getItem, queryGSI1, queryByPK } from '../lib/dynamo';
import { verify, sign } from '../lib/formsToken';
import { requireSession } from './common';
import { withSentry } from '../lib/sentry';
import { UpdateFormRecord } from '../lib/models';

const updateFormsHandler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const path = event.rawPath || event.requestContext.http?.path || '';

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  // PUBLIC: resolve agency from token
  if (method === 'GET' && path.endsWith('/update-forms/agency')) {
    const token = event.queryStringParameters?.token;
    if (!token) return response(400, { ok: false, error: 'Missing token' }, origin);
    const payload = verify<{ agencyEmail: string; type?: string }>(token);
    if (!payload?.agencyEmail || payload.type !== 'update') {
      return response(400, { ok: false, error: 'Invalid or expired token' }, origin);
    }
    const agencies = await queryGSI1(`EMAIL#${payload.agencyEmail}`, 'AGENCY#');
    const agency = agencies?.[0];
    if (!agency) return response(404, { ok: false, error: 'Agency not found' }, origin);
    return response(200, { ok: true, agency: { name: agency.name, email: agency.email, settings: agency.settings || {} } }, origin);
  }

  // PUBLIC: submit update form
  if (method === 'POST' && path.endsWith('/update-forms/submit')) {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const body = JSON.parse(event.body);
    const { token, form } = body;
    if (!token || !form) return response(400, { ok: false, error: 'Missing token or form data' }, origin);

    const payload = verify<{ agencyEmail: string; clientId: string; type?: string }>(token);
    if (!payload?.agencyEmail || !payload?.clientId || payload.type !== 'update') {
      return response(400, { ok: false, error: 'Invalid or expired token' }, origin);
    }
    const agencies = await queryGSI1(`EMAIL#${payload.agencyEmail}`, 'AGENCY#');
    const agency = agencies?.[0];
    if (!agency) return response(404, { ok: false, error: 'Agency not found' }, origin);

    const id = newId('update-form');
    const now = Date.now();
    const submission: UpdateFormRecord = {
      PK: `AGENCY#${agency.id}`,
      SK: `UPDATE_FORM#${now}#${payload.clientId}`,
      GSI3PK: `CLIENT#${payload.clientId}`,
      GSI3SK: `UPDATE_FORM#${now}`,
      id,
      agencyId: agency.id,
      clientId: payload.clientId,
      size: form.size,
      speed: form.speed,
      academics: form.academics,
      upcomingEvents: form.upcomingEvents,
      highlightVideo: form.highlightVideo,
      schoolInterests: form.schoolInterests,
      notes: form.notes,
      submittedAt: now,
    };
    await putItem(submission);
    return response(200, { ok: true, id }, origin);
  }

  // PRIVATE: issue update form token
  if (method === 'POST' && path.endsWith('/update-forms/issue')) {
    const session = requireSession(event);
    if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const { clientId } = JSON.parse(event.body || '{}');
    if (!clientId) return response(400, { ok: false, error: 'clientId is required' }, origin);

    const payload = {
      agencyEmail: session.agencyEmail,
      clientId,
      type: 'update',
      iat: Date.now(),
      exp: Date.now() + (1000 * 60 * 60 * 24 * 30),
    };
    const token = sign(payload);
    const frontendHost = process.env.FRONTEND_URL || 'www.myrecruiteragency.com';
    const base = frontendHost.startsWith('http') ? frontendHost : `https://${frontendHost}`;
    const url = `${base}/update/${token}`;
    return response(200, { ok: true, token, url }, origin);
  }

  // PRIVATE: list update submissions
  if (method === 'GET' && path.endsWith('/update-forms/submissions')) {
    const session = requireSession(event);
    if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);
    const clientId = event.queryStringParameters?.clientId;
    let items = await queryByPK(`AGENCY#${session.agencyId}`, 'UPDATE_FORM#') as UpdateFormRecord[];
    if (clientId) items = items.filter((i) => i.clientId === clientId);
    return response(200, { ok: true, items }, origin);
  }

  // PRIVATE: mark update form as reviewed
  if (method === 'POST' && path.endsWith('/update-forms/consume')) {
    const session = requireSession(event);
    if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const { ids } = JSON.parse(event.body || '{}');
    if (!Array.isArray(ids)) return response(400, { ok: false, error: 'ids must be array' }, origin);
    for (const id of ids) {
      const items = await queryByPK(`AGENCY#${session.agencyId}`, 'UPDATE_FORM#') as UpdateFormRecord[];
      const item = (items || []).find((i) => i.id === id);
      if (item) {
        await putItem({ ...item, reviewedAt: Date.now(), reviewedBy: session.agencyEmail || 'agent' });
      }
    }
    return response(200, { ok: true }, origin);
  }

  return response(404, { ok: false, error: 'Path not found' }, origin);
};

export const handler = withSentry(updateFormsHandler);
