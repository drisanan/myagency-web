import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, badRequest, ok, requireSession } from './common';
import { newId } from '../lib/ids';
import { CoachListRecord } from '../lib/models';
import { getItem, putItem, queryByPK } from '../lib/dynamo';

function getListId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const method = event.requestContext.http?.method?.toUpperCase();
  if (!method) return badRequest('Missing method');

  const session = requireSession(event);
  if (!session) return badRequest('Missing session (x-agency-id header expected for now)');

  const listId = getListId(event);

  if (method === 'GET') {
    if (listId) {
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST#${listId}` });
      return ok({ ok: true, list: item ?? null });
    }
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'LIST#');
    return ok({ ok: true, lists: items });
  }

  if (method === 'POST') {
    if (!event.body) return badRequest('Missing body');
    const payload = JSON.parse(event.body);
    const id = payload.id || newId('list');
    const now = Date.now();
    const rec: CoachListRecord = {
      PK: `AGENCY#${session.agencyId}`,
      SK: `LIST#${id}`,
      id,
      name: payload.name,
      items: payload.items ?? [],
      agencyId: session.agencyId,
      agencyEmail: session.agencyEmail,
      createdAt: now,
      updatedAt: now,
    };
    await putItem(rec);
    return ok({ ok: true, list: rec });
  }

  if (method === 'PUT' || method === 'PATCH') {
    if (!listId) return badRequest('Missing list id');
    if (!event.body) return badRequest('Missing body');
    const payload = JSON.parse(event.body);
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST#${listId}` });
    if (!existing) return ok({ ok: false, message: 'Not found' });
    const now = Date.now();
    const merged = { ...existing, ...payload, updatedAt: now };
    await putItem(merged);
    return ok({ ok: true, list: merged });
  }

  if (method === 'DELETE') {
    if (!listId) return badRequest('Missing list id');
    await putItem({
      PK: `AGENCY#${session.agencyId}`,
      SK: `LIST#${listId}`,
      deletedAt: new Date().toISOString(),
    });
    return ok({ ok: true });
  }

  return badRequest(`Unsupported method ${method}`);
};

