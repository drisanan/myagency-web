import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { ClientRecord } from '../lib/models';
import { getItem, putItem, queryByPK } from '../lib/dynamo';
import { response } from './cors';

function getClientId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session (x-agency-id header expected for now)' }, origin);

  const clientId = getClientId(event);

  if (method === 'GET') {
    if (clientId) {
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `CLIENT#${clientId}` });
      return response(200, { ok: true, client: item ?? null }, origin);
    }
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'CLIENT#');
    return response(200, { ok: true, clients: items }, origin);
  }

  if (method === 'POST') {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const payload = JSON.parse(event.body);
    const id = payload.id || newId('client');
    const now = new Date().toISOString();
    const rec: ClientRecord = {
      PK: `AGENCY#${session.agencyId}`,
      SK: `CLIENT#${id}`,
      GSI1PK: `EMAIL#${payload.email}`,
      GSI1SK: `CLIENT#${id}`,
      id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      sport: payload.sport,
      agencyId: session.agencyId,
      agencyEmail: session.agencyEmail,
      createdAt: now,
      updatedAt: now,
    };
    await putItem(rec);
    return response(200, { ok: true, client: rec }, origin);
  }

  if (method === 'PUT' || method === 'PATCH') {
    if (!clientId) return response(400, { ok: false, error: 'Missing client id' }, origin);
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const payload = JSON.parse(event.body);
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `CLIENT#${clientId}` });
    if (!existing) return response(404, { ok: false, message: 'Not found' }, origin);
    const now = new Date().toISOString();
    const merged = { ...existing, ...payload, updatedAt: now };
    await putItem(merged);
    return response(200, { ok: true, client: merged }, origin);
  }

  if (method === 'DELETE') {
    if (!clientId) return response(400, { ok: false, error: 'Missing client id' }, origin);
    await putItem({
      PK: `AGENCY#${session.agencyId}`,
      SK: `CLIENT#${clientId}`,
      deletedAt: new Date().toISOString(),
    });
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: `Method not allowed` }, origin);
};

