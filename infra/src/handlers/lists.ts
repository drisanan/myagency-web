import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { CoachListRecord } from '../lib/models';
import { getItem, putItem, queryByPK } from '../lib/dynamo';
import { response } from './cors';

function getListId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session (x-agency-id header expected for now)' }, origin);

  const listId = getListId(event);

  if (method === 'GET') {
    if (listId) {
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST#${listId}` });
      return response(200, { ok: true, list: item ?? null }, origin);
    }
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'LIST#');
    return response(200, { ok: true, lists: items }, origin);
  }

  if (method === 'POST') {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
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
    return response(200, { ok: true, list: rec }, origin);
  }

  if (method === 'PUT' || method === 'PATCH') {
    if (!listId) return response(400, { ok: false, error: 'Missing list id' }, origin);
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const payload = JSON.parse(event.body);
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST#${listId}` });
    if (!existing) return response(404, { ok: false, message: 'Not found' }, origin);
    const now = Date.now();
    const merged = { ...existing, ...payload, updatedAt: now };
    await putItem(merged);
    return response(200, { ok: true, list: merged }, origin);
  }

  if (method === 'DELETE') {
    if (!listId) return response(400, { ok: false, error: 'Missing list id' }, origin);
    await putItem({
      PK: `AGENCY#${session.agencyId}`,
      SK: `LIST#${listId}`,
      deletedAt: new Date().toISOString(),
    });
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: `Method not allowed` }, origin);
};

