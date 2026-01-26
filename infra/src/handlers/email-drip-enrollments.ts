import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { DripEnrollmentRecord, EmailDripRecord } from '../lib/models';
import { deleteItem, getItem, putItem, queryByPK } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

function enrollmentKey(dripId: string, clientId: string) {
  return `DRIP_ENROLL#${dripId}#${clientId}`;
}

const enrollmentsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);
  if (session.role === 'client') return response(403, { ok: false, error: 'Forbidden' }, origin);

  const agencyId = session.agencyId.trim();
  const qs = event.queryStringParameters || {};

  if (method === 'GET') {
    let items = await queryByPK(`AGENCY#${agencyId}`, 'DRIP_ENROLL#') as DripEnrollmentRecord[];
    if (qs.clientId) {
      items = items.filter((i) => i.clientId === qs.clientId);
    }
    if (qs.dripId) {
      items = items.filter((i) => i.dripId === qs.dripId);
    }
    return response(200, { ok: true, enrollments: items }, origin);
  }

  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    const { dripId, clientId } = payload || {};
    if (!dripId || !clientId) return badRequest(origin, 'dripId and clientId are required');

    const drip = await getItem({ PK: `AGENCY#${agencyId}`, SK: `EMAIL_DRIP#${dripId}` }) as EmailDripRecord | undefined;
    if (!drip) return response(404, { ok: false, error: 'Drip not found' }, origin);
    if (!drip.isActive) return response(400, { ok: false, error: 'Drip is inactive' }, origin);
    if (!drip.steps?.length) return response(400, { ok: false, error: 'Drip has no steps' }, origin);

    const now = Date.now();
    const firstStep = drip.steps[0];
    const nextSendAt = now + Math.max(0, Number(firstStep.dayOffset || 0)) * 24 * 60 * 60 * 1000;

    const rec: DripEnrollmentRecord = {
      PK: `AGENCY#${agencyId}`,
      SK: enrollmentKey(dripId, clientId),
      dripId,
      clientId,
      agencyId,
      currentStepIndex: 0,
      startedAt: now,
      nextSendAt,
    };
    await putItem(rec);
    return response(200, { ok: true, enrollment: rec }, origin);
  }

  if (method === 'DELETE') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    const { dripId, clientId } = payload || {};
    if (!dripId || !clientId) return badRequest(origin, 'dripId and clientId are required');
    await deleteItem({ PK: `AGENCY#${agencyId}`, SK: enrollmentKey(dripId, clientId) });
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(enrollmentsHandler);
