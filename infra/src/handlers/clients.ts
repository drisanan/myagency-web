import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { ClientRecord } from '../lib/models';
import { hashAccessCode } from '../lib/auth';
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

  // CRITICAL FIX: Trim any invisible whitespace from the ID
  const cleanAgencyId = session.agencyId.trim();
  const clientId = getClientId(event);

  // --- GET ---
  if (method === 'GET') {
    // A. Get Single Client
    if (clientId) {
      const item = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: `CLIENT#${clientId}` });
      return response(200, { ok: true, client: item ?? null }, origin);
    }
    
    // B. List All Clients
    const pk = `AGENCY#${cleanAgencyId}`;
    
    // Attempt 1: Standard Optimized Query
    let items = await queryByPK(pk, 'CLIENT#');

    // Attempt 2: Fallback (If DynamoDB SK filtering is behaving unexpectedly)
    // If we get 0 results, but we know data exists, try querying JUST the PK.
    if (items.length === 0) {
      console.log('[Clients] WARN: Standard query returned 0. Attempting PK-only fallback.', { pk });
      
      const allAgencyItems = await queryByPK(pk); // Fetch PROFILE, TASKS, CLIENTS, etc.
      
      // Filter for clients in memory
      const recoveredClients = allAgencyItems.filter((i: any) => i.SK && i.SK.startsWith('CLIENT#'));
      
      if (recoveredClients.length > 0) {
        console.log('[Clients] RECOVERED: Found clients via manual memory filter.', { count: recoveredClients.length });
        items = recoveredClients;
      } else {
        console.log('[Clients] ERROR: PK-only query also returned 0 clients.', { 
           totalItemsFound: allAgencyItems.length,
           typesFound: allAgencyItems.map((i: any) => i.SK)
        });
      }
    }

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
    
    // Use the cleaned ID
    let accessCodeHash: string | undefined;
    if (payload.accessCode) {
      accessCodeHash = await hashAccessCode(payload.accessCode);
    }

    const rec: ClientRecord = {
      PK: `AGENCY#${cleanAgencyId}`,
      SK: `CLIENT#${id}`,
      GSI1PK: `EMAIL#${payload.email}`,
      GSI1SK: `CLIENT#${id}`,
      id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      sport: payload.sport,
      agencyId: cleanAgencyId,
      agencyEmail: session.agencyEmail,
      phone: payload.phone,
      accessCodeHash,
      authEnabled: Boolean(accessCodeHash),
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
    
    const existing = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: `CLIENT#${clientId}` });
    if (!existing) return response(404, { ok: false, message: 'Not found' }, origin);
    
    const now = new Date().toISOString();
    const merged = { ...existing, ...payload, updatedAt: now };
    if (payload.accessCode) {
      merged.accessCodeHash = await hashAccessCode(payload.accessCode);
      merged.authEnabled = true;
    }
    await putItem(merged);
    return response(200, { ok: true, client: merged }, origin);
  }

  // --- DELETE ---
  if (method === 'DELETE') {
    if (!clientId) return response(400, { ok: false, error: 'Missing client id' }, origin);
    
    const existing = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: `CLIENT#${clientId}` });
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