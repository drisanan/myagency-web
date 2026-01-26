import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { EmailDripRecord, DripEmailStep } from '../lib/models';
import { deleteItem, getItem, putItem, queryByPK } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

function normalizeSteps(raw: any): DripEmailStep[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((step, i) => ({
    id: String(step.id || `step-${i + 1}`),
    dayOffset: Number(step.dayOffset || 0),
    subject: String(step.subject || '').trim(),
    body: String(step.body || '').trim(),
    templateId: step.templateId ? String(step.templateId) : undefined,
  }));
}

function validateSteps(steps: DripEmailStep[]) {
  if (!steps.length) return 'At least one step is required';
  for (const step of steps) {
    if (!Number.isFinite(step.dayOffset) || step.dayOffset < 0) {
      return 'Each step must have a non-negative dayOffset';
    }
    if (!step.subject) return 'Each step must include a subject';
    if (!step.body) return 'Each step must include a body';
  }
  return '';
}

function dripIdFromEvent(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

const emailDripsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);
  if (session.role === 'client') return response(403, { ok: false, error: 'Forbidden' }, origin);

  const agencyId = session.agencyId.trim();
  const dripId = dripIdFromEvent(event);

  if (method === 'GET') {
    if (dripId) {
      const item = await getItem({ PK: `AGENCY#${agencyId}`, SK: `EMAIL_DRIP#${dripId}` });
      return response(200, { ok: true, drip: item ?? null }, origin);
    }
    const items = await queryByPK(`AGENCY#${agencyId}`, 'EMAIL_DRIP#');
    return response(200, { ok: true, drips: items }, origin);
  }

  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    const steps = normalizeSteps(payload.steps);
    const stepErr = validateSteps(steps);
    if (!payload.name || typeof payload.name !== 'string') return badRequest(origin, 'name is required');
    if (stepErr) return badRequest(origin, stepErr);
    const id = payload.id || newId('drip');
    const now = Date.now();
    const rec: EmailDripRecord = {
      PK: `AGENCY#${agencyId}`,
      SK: `EMAIL_DRIP#${id}`,
      id,
      agencyId,
      agencyEmail: session.agencyEmail,
      name: String(payload.name).trim(),
      description: payload.description ? String(payload.description).trim() : undefined,
      isActive: payload.isActive !== false,
      senderClientId: payload.senderClientId ? String(payload.senderClientId) : undefined,
      triggerEvent: payload.triggerEvent || 'manual',
      programLevel: payload.programLevel || undefined,
      steps,
      createdAt: now,
      updatedAt: now,
    };
    await putItem(rec);
    return response(200, { ok: true, drip: rec }, origin);
  }

  if (method === 'PUT' || method === 'PATCH') {
    if (!dripId) return badRequest(origin, 'Missing drip id');
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    const existing = await getItem({ PK: `AGENCY#${agencyId}`, SK: `EMAIL_DRIP#${dripId}` }) as EmailDripRecord | undefined;
    if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);

    const steps = payload.steps ? normalizeSteps(payload.steps) : existing.steps;
    const stepErr = validateSteps(steps);
    if (stepErr) return badRequest(origin, stepErr);

    const merged: EmailDripRecord = {
      ...existing,
      ...payload,
      name: payload.name ? String(payload.name).trim() : existing.name,
      description: payload.description !== undefined ? String(payload.description || '').trim() || undefined : existing.description,
      senderClientId: payload.senderClientId !== undefined ? String(payload.senderClientId || '') || undefined : existing.senderClientId,
      steps,
      updatedAt: Date.now(),
    };
    await putItem(merged);
    return response(200, { ok: true, drip: merged }, origin);
  }

  if (method === 'DELETE') {
    if (!dripId) return badRequest(origin, 'Missing drip id');
    await deleteItem({ PK: `AGENCY#${agencyId}`, SK: `EMAIL_DRIP#${dripId}` });
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(emailDripsHandler);
