import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { ClientRecord } from '../lib/models';
import { getItem, putItem, queryByPK } from '../lib/dynamo';
import { response } from './cors';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

function getClientId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  // 1. Handle OPTIONS for CORS Preflight
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  // 2. Validate Session
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const clientId = getClientId(event);

  // --- GET ---
  if (method === 'GET') {
    if (clientId) {
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `CLIENT#${clientId}` });
      return response(200, { ok: true, client: item ?? null }, origin);
    }
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'CLIENT#');
    return response(200, { ok: true, clients: items }, origin);
  }

  // --- POST ---
  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    if (!payload.email || !payload.firstName || !payload.lastName || !payload.sport) {
      return badRequest(origin, 'email, firstName, lastName, sport are required');
    }
    
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

  // --- PUT / PATCH ---
  if (method === 'PUT' || method === 'PATCH') {
    if (!clientId) return badRequest(origin, 'Missing client id');
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `CLIENT#${clientId}` });
    if (!existing) return response(404, { ok: false, message: 'Not found' }, origin);
    
    const now = new Date().toISOString();
    const merged = { ...existing, ...payload, updatedAt: now };
    await putItem(merged);
    return response(200, { ok: true, client: merged }, origin);
  }

  // --- DELETE ---
  if (method === 'DELETE') {
    if (!clientId) return response(400, { ok: false, error: 'Missing client id' }, origin);
    
    // Soft Delete: Fetch first to preserve data
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `CLIENT#${clientId}` });
    if (existing) {
      await putItem({
        ...existing,
        deletedAt: new Date().toISOString(),
      });
    }
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: `Method not allowed` }, origin);
};