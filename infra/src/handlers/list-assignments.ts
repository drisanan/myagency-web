import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { getItem, putItem, deleteItem, queryByPK, queryGSI3 } from '../lib/dynamo';
import { ListAssignmentRecord, CoachListRecord } from '../lib/models';
import { response } from './cors';
import { withSentry } from '../lib/sentry';
import { newId } from '../lib/ids';

const listAssignmentsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const qs = event.queryStringParameters || {};
  const clientId = session.role === 'client' ? session.clientId : (qs.clientId || '');
  const listId = qs.listId || '';

  if (method === 'GET') {
    if (session.role === 'client' && !clientId) {
      return response(400, { ok: false, error: 'Missing clientId' }, origin);
    }
    if (!clientId && !listId) {
      return response(400, { ok: false, error: 'clientId or listId required' }, origin);
    }

    let assignments: ListAssignmentRecord[] = [];
    if (clientId) {
      try {
        assignments = await queryGSI3(`CLIENT#${clientId}`, 'LIST_ASSIGN#') as ListAssignmentRecord[];
      } catch {
        const all = await queryByPK(`AGENCY#${session.agencyId}`, 'LIST_ASSIGN#') as ListAssignmentRecord[];
        assignments = all.filter((a) => a.clientId === clientId);
      }
    } else if (listId) {
      const all = await queryByPK(`AGENCY#${session.agencyId}`, 'LIST_ASSIGN#') as ListAssignmentRecord[];
      assignments = all.filter((a) => a.listId === listId);
    }

    if (qs.includeLists === 'true') {
      const listIds = Array.from(new Set(assignments.map((a) => a.listId)));
      const lists = await Promise.all(
        listIds.map((id) => getItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST#${id}` }))
      );
      return response(200, { ok: true, assignments, lists: lists.filter(Boolean) }, origin);
    }

    return response(200, { ok: true, assignments }, origin);
  }

  if (method === 'POST') {
    if (session.role === 'client') {
      return response(403, { ok: false, error: 'Forbidden' }, origin);
    }
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const payload = JSON.parse(event.body);
    const assignClientId = payload.clientId;
    const assignListId = payload.listId;
    if (!assignClientId || !assignListId) {
      return response(400, { ok: false, error: 'clientId and listId required' }, origin);
    }

    const list = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST#${assignListId}` }) as CoachListRecord | undefined;
    if (!list) return response(404, { ok: false, error: 'List not found' }, origin);
    if (list.type === 'CLIENT_INTEREST') {
      return response(400, { ok: false, error: 'Client interest lists cannot be assigned' }, origin);
    }

    const id = newId('list-assign');
    const now = Date.now();
    const rec: ListAssignmentRecord = {
      PK: `AGENCY#${session.agencyId}`,
      SK: `LIST_ASSIGN#${assignListId}#${assignClientId}`,
      GSI3PK: `CLIENT#${assignClientId}`,
      GSI3SK: `LIST_ASSIGN#${assignListId}`,
      id,
      agencyId: session.agencyId,
      listId: assignListId,
      clientId: assignClientId,
      assignedBy: session.agentEmail || session.agencyEmail || 'agent',
      assignedAt: now,
    };
    await putItem(rec);
    return response(200, { ok: true, assignment: rec }, origin);
  }

  if (method === 'DELETE') {
    if (session.role === 'client') {
      return response(403, { ok: false, error: 'Forbidden' }, origin);
    }
    const deleteClientId = qs.clientId;
    const deleteListId = qs.listId;
    if (!deleteClientId || !deleteListId) {
      return response(400, { ok: false, error: 'clientId and listId required' }, origin);
    }
    await deleteItem({ PK: `AGENCY#${session.agencyId}`, SK: `LIST_ASSIGN#${deleteListId}#${deleteClientId}` });
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(listAssignmentsHandler);
