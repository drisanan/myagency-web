import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors';
import { newId } from '../lib/ids';
import { putItem, getItem, queryGSI1, queryGSI3, queryByPK } from '../lib/dynamo';
import { verify, sign } from '../lib/formsToken';
import { requireAgencySession } from './common';
import { withSentry } from '../lib/sentry';
import { UpdateFormRecord } from '../lib/models';

type UpdateTokenPayload = {
  agencyEmail: string;
  agencyId?: string;
  clientId: string;
  type?: 'update';
};

async function resolveAgency(payload: UpdateTokenPayload) {
  const agencies = await queryGSI1(`EMAIL#${payload.agencyEmail}`, 'AGENCY#');
  if (!payload.agencyId) return agencies?.[0];
  return (agencies || []).find((agency: any) => agency.id === payload.agencyId) || agencies?.[0];
}

function cleanString(value: unknown, maxLength = 1000) {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  return normalized ? normalized.slice(0, maxLength) : undefined;
}

function normalizeUpdateForm(form: Record<string, any>) {
  return {
    size: {
      ...(cleanString(form?.size?.height, 80) ? { height: cleanString(form.size.height, 80) } : {}),
      ...(cleanString(form?.size?.weight, 80) ? { weight: cleanString(form.size.weight, 80) } : {}),
      ...(cleanString(form?.size?.wingspan, 80) ? { wingspan: cleanString(form.size.wingspan, 80) } : {}),
    },
    speed: {
      ...(cleanString(form?.speed?.fortyYard, 80) ? { fortyYard: cleanString(form.speed.fortyYard, 80) } : {}),
      ...(cleanString(form?.speed?.shuttle, 80) ? { shuttle: cleanString(form.speed.shuttle, 80) } : {}),
      ...(cleanString(form?.speed?.vertical, 80) ? { vertical: cleanString(form.speed.vertical, 80) } : {}),
    },
    academics: {
      ...(cleanString(form?.academics?.gpa, 80) ? { gpa: cleanString(form.academics.gpa, 80) } : {}),
      ...(cleanString(form?.academics?.satScore, 80) ? { satScore: cleanString(form.academics.satScore, 80) } : {}),
      ...(cleanString(form?.academics?.actScore, 80) ? { actScore: cleanString(form.academics.actScore, 80) } : {}),
      ...(cleanString(form?.academics?.classRank, 80) ? { classRank: cleanString(form.academics.classRank, 80) } : {}),
    },
    upcomingEvents: Array.isArray(form?.upcomingEvents)
      ? form.upcomingEvents
          .map((event: Record<string, unknown>) => {
            const name = cleanString(event?.name, 200);
            const date = cleanString(event?.date, 80);
            const location = cleanString(event?.location, 200);
            if (!name || !date) return null;
            return {
              name,
              date,
              ...(location ? { location } : {}),
            };
          })
          .filter((event): event is { name: string; date: string; location?: string } => Boolean(event))
          .slice(0, 10)
      : [],
    highlightVideo: cleanString(form?.highlightVideo, 2000),
    schoolInterests: Array.isArray(form?.schoolInterests)
      ? form.schoolInterests
          .map((entry: unknown) => cleanString(entry, 200))
          .filter((entry): entry is string => Boolean(entry))
      : [],
    notes: cleanString(form?.notes, 4000),
  };
}

const updateFormsHandler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const path = event.rawPath || event.requestContext.http?.path || '';

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  // PUBLIC: resolve agency from token
  if (method === 'GET' && path.endsWith('/update-forms/agency')) {
    const token = event.queryStringParameters?.token;
    if (!token) return response(400, { ok: false, error: 'Missing token' }, origin);
    const payload = verify<UpdateTokenPayload>(token);
    if (!payload?.agencyEmail || payload.type !== 'update') {
      return response(400, { ok: false, error: 'Invalid or expired token' }, origin);
    }
    const agency = await resolveAgency(payload);
    if (!agency) return response(404, { ok: false, error: 'Agency not found' }, origin);
    const client = await getItem({ PK: `AGENCY#${agency.id}`, SK: `CLIENT#${payload.clientId}` });
    if (!client) return response(404, { ok: false, error: 'Client not found' }, origin);
    return response(200, {
      ok: true,
      agency: { name: agency.name, email: agency.email, settings: agency.settings || {} },
      client: {
        id: (client as any).id,
        firstName: (client as any).firstName,
        lastName: (client as any).lastName,
      },
    }, origin);
  }

  // PUBLIC: submit update form
  if (method === 'POST' && path.endsWith('/update-forms/submit')) {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    let body: Record<string, any>;
    try {
      body = JSON.parse(event.body);
    } catch {
      return response(400, { ok: false, error: 'Invalid JSON body' }, origin);
    }
    const { token, form } = body;
    if (!token || !form) return response(400, { ok: false, error: 'Missing token or form data' }, origin);

    const payload = verify<UpdateTokenPayload>(token);
    if (!payload?.agencyEmail || !payload?.clientId || payload.type !== 'update') {
      return response(400, { ok: false, error: 'Invalid or expired token' }, origin);
    }
    const agency = await resolveAgency(payload);
    if (!agency) return response(404, { ok: false, error: 'Agency not found' }, origin);
    const client = await getItem({ PK: `AGENCY#${agency.id}`, SK: `CLIENT#${payload.clientId}` });
    if (!client) return response(404, { ok: false, error: 'Client not found' }, origin);

    const id = newId('update-form');
    const now = Date.now();
    const normalized = normalizeUpdateForm(form);
    const submission: UpdateFormRecord = {
      PK: `AGENCY#${agency.id}`,
      SK: `UPDATE_FORM#${now}#${payload.clientId}`,
      GSI3PK: `CLIENT#${payload.clientId}`,
      GSI3SK: `UPDATE_FORM#${now}`,
      id,
      agencyId: agency.id,
      clientId: payload.clientId,
      size: normalized.size,
      speed: normalized.speed,
      academics: normalized.academics,
      upcomingEvents: normalized.upcomingEvents,
      highlightVideo: normalized.highlightVideo,
      schoolInterests: normalized.schoolInterests,
      notes: normalized.notes,
      submittedAt: now,
    };
    await putItem(submission);
    return response(200, { ok: true, id }, origin);
  }

  // PRIVATE: issue update form token
  if (method === 'POST' && path.endsWith('/update-forms/issue')) {
    const session = requireAgencySession(event);
    if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const { clientId } = JSON.parse(event.body || '{}');
    if (!clientId) return response(400, { ok: false, error: 'clientId is required' }, origin);

    const payload = {
      agencyEmail: session.agencyEmail,
      agencyId: session.agencyId,
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
    const session = requireAgencySession(event);
    if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);
    const clientId = event.queryStringParameters?.clientId;
    let items = clientId
      ? await queryGSI3(`CLIENT#${clientId}`, 'UPDATE_FORM#') as UpdateFormRecord[]
      : await queryByPK(`AGENCY#${session.agencyId}`, 'UPDATE_FORM#') as UpdateFormRecord[];
    items = items
      .filter((item) => item.agencyId === session.agencyId)
      .sort((a, b) => b.submittedAt - a.submittedAt);
    return response(200, { ok: true, items }, origin);
  }

  // PRIVATE: mark update form as reviewed
  if (method === 'POST' && path.endsWith('/update-forms/consume')) {
    const session = requireAgencySession(event);
    if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    let payload: Record<string, any>;
    try {
      payload = JSON.parse(event.body || '{}');
    } catch {
      return response(400, { ok: false, error: 'Invalid JSON body' }, origin);
    }
    const { ids } = payload;
    if (!Array.isArray(ids)) return response(400, { ok: false, error: 'ids must be array' }, origin);
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'UPDATE_FORM#') as UpdateFormRecord[];
    let reviewed = 0;
    for (const id of ids) {
      const item = (items || []).find((i) => i.id === id);
      if (item) {
        await putItem({ ...item, reviewedAt: Date.now(), reviewedBy: session.agencyEmail || 'agent' });
        reviewed += 1;
      }
    }
    return response(200, { ok: true, reviewed }, origin);
  }

  return response(404, { ok: false, error: 'Path not found' }, origin);
};

export const handler = withSentry(updateFormsHandler);
