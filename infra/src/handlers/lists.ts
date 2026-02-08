import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { CoachListRecord } from '../lib/models';
import { getItem, putItem, queryByPK, queryByPKPaginated } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

function getListId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

const listsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  // 1. Secure Session Check
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const listId = getListId(event);

  // --- GET ---
  if (method === 'GET') {
    if (listId) {
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST#${listId}` });
      return response(200, { ok: true, list: item ?? null }, origin);
    }

    const qs = event.queryStringParameters || {};

    // Paginated path
    if (qs.limit || qs.cursor) {
      const { items, nextCursor } = await queryByPKPaginated(`AGENCY#${session.agencyId}`, 'LIST#', {
        limit: qs.limit ? parseInt(qs.limit, 10) : 50,
        cursor: qs.cursor || undefined,
      });
      const filtered = session.role === 'client'
        ? items.filter((i: any) => i.clientId === session.clientId && i.type === 'CLIENT_INTEREST')
        : items;
      return response(200, { ok: true, lists: filtered, nextCursor }, origin);
    }

    // Legacy path
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'LIST#');
    const filtered = session.role === 'client'
      ? items.filter((i: any) => i.clientId === session.clientId && i.type === 'CLIENT_INTEREST')
      : items;
    return response(200, { ok: true, lists: filtered }, origin);
  }

  // --- POST ---
  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    if (!payload.name) return badRequest(origin, 'name is required');
    if (payload.items && !Array.isArray(payload.items)) return badRequest(origin, 'items must be an array');
    if (session.role === 'client') {
      // Enforce client restrictions
      payload.type = 'CLIENT_INTEREST';
      payload.clientId = session.clientId;
      // Normalize university/school; drop empty entries
      if (Array.isArray(payload.items)) {
        payload.items = payload.items
          .map((i: any) => {
            if (!i) return null;
            const uni = i.university || i.school || i.name || '';
            return {
              ...i,
              university: uni,
              school: i.school || uni,
            };
          })
          .filter((i: any) => i && (i.university || i.school));
      } else {
        payload.items = [];
      }
    }
    
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
      clientId: payload.clientId,
      type: payload.type,
      createdAt: now,
      updatedAt: now,
    };
    await putItem(rec);
    return response(200, { ok: true, list: rec }, origin);
  }

  // --- PUT / PATCH ---
  if (method === 'PUT' || method === 'PATCH') {
    if (!listId) return badRequest(origin, 'Missing list id');
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST#${listId}` });
    if (!existing) return response(404, { ok: false, message: 'Not found' }, origin);
    
    const now = Date.now();
    const merged = {
      ...existing,
      ...payload,
      createdAt:
        typeof existing.createdAt === 'string'
          ? Number(existing.createdAt) || now
          : existing.createdAt ?? now,
      updatedAt: now,
    };
    await putItem(merged);
    return response(200, { ok: true, list: merged }, origin);
  }

  // --- DELETE (Soft Delete) ---
  if (method === 'DELETE') {
    if (!listId) return response(400, { ok: false, error: 'Missing list id' }, origin);
    
    // FIX: Fetch first to preserve data during soft delete
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST#${listId}` });
    
    if (existing) {
      await putItem({
        ...existing, // Keep the name and items!
        deletedAt: new Date().toISOString(),
      });
    } else {
      // If it doesn't exist, we can just return success or 404. 
      // Returning success is idempotent.
    }
    
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: `Method not allowed` }, origin);
};

export const handler = withSentry(listsHandler);