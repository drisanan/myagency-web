import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, badRequest, ok, requireSession } from './common';
import { newId } from '../lib/ids';
import { ClientRecord } from '../lib/models';
import { getItem, putItem, queryByPK } from '../lib/dynamo';

function getClientId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const method = event.requestContext.http?.method?.toUpperCase();
  if (!method) return badRequest('Missing method');

  const session = requireSession(event);
  if (!session) return badRequest('Missing session (x-agency-id header expected for now)');

  const clientId = getClientId(event);

  if (method === 'GET') {
    if (clientId) {
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `CLIENT#${clientId}` });
      return ok({ ok: true, client: item ?? null });
    }
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'CLIENT#');
    return ok({ ok: true, clients: items });
  }

  if (method === 'POST') {
    if (!event.body) return badRequest('Missing body');
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
    return ok({ ok: true, client: rec });
  }

  if (method === 'PUT' || method === 'PATCH') {
    if (!clientId) return badRequest('Missing client id');
    if (!event.body) return badRequest('Missing body');
    const payload = JSON.parse(event.body);
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `CLIENT#${clientId}` });
    if (!existing) return ok({ ok: false, message: 'Not found' });
    const now = new Date().toISOString();
    const merged = { ...existing, ...payload, updatedAt: now };
    await putItem(merged);
    return ok({ ok: true, client: merged });
  }

  if (method === 'DELETE') {
    if (!clientId) return badRequest('Missing client id');
    await putItem({
      PK: `AGENCY#${session.agencyId}`,
      SK: `CLIENT#${clientId}`,
      deletedAt: new Date().toISOString(),
    });
    return ok({ ok: true });
  }

  return badRequest(`Unsupported method ${method}`);
};

