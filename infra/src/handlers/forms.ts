import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, badRequest, ok, requireSession } from './common';
import { newId } from '../lib/ids';
import { FormSubmissionRecord } from '../lib/models';
import { getItem, putItem, queryByPK } from '../lib/dynamo';

function getFormId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const method = event.requestContext.http?.method?.toUpperCase();
  if (!method) return badRequest('Missing method');

  const session = requireSession(event);
  if (!session) return badRequest('Missing session (x-agency-id header expected for now)');

  const formId = getFormId(event);

  if (method === 'GET') {
    if (formId) {
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `FORM#${formId}` });
      return ok({ ok: true, submission: item ?? null });
    }
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'FORM#');
    const pending = items.filter((s) => !s.consumed);
    return ok({ ok: true, submissions: pending });
  }

  if (method === 'POST') {
    if (!event.body) return badRequest('Missing body');
    const payload = JSON.parse(event.body);
    const id = payload.id || newId('form');
    const now = Date.now();
    const ttl = payload.ttl || undefined;
    const rec: FormSubmissionRecord = {
      PK: `AGENCY#${session.agencyId}`,
      SK: `FORM#${id}`,
      id,
      agencyId: session.agencyId,
      agencyEmail: session.agencyEmail,
      data: payload.data ?? payload,
      createdAt: now,
      consumed: false,
      ...(ttl ? { ttl } : {}),
    };
    await putItem(rec);
    return ok({ ok: true, submission: rec });
  }

  if (method === 'DELETE') {
    if (!formId) return badRequest('Missing form id');
    const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `FORM#${formId}` });
    if (!item) return ok({ ok: false, message: 'Not found' });
    const updated = { ...item, consumed: true };
    await putItem(updated);
    return ok({ ok: true });
  }

  return badRequest(`Unsupported method ${method}`);
};

