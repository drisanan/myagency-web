import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { TaskRecord } from '../lib/models';
import { getItem, putItem, queryByPK } from '../lib/dynamo';
import { response } from './cors';

type TaskStatus = 'todo' | 'in-progress' | 'done';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

function getTaskId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

function validateStatus(status: any): status is TaskStatus {
  return status === 'todo' || status === 'in-progress' || status === 'done';
}

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const taskId = getTaskId(event);

  if (method === 'GET') {
    if (taskId) {
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `TASK#${taskId}` });
      if (session.role === 'client' && item?.assigneeClientId !== session.clientId) {
        return response(403, { ok: false, error: 'Forbidden' }, origin);
      }
      return response(200, { ok: true, task: item ?? null }, origin);
    }
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'TASK#');
    if (session.role === 'client') {
      const mine = (items || []).filter((t: any) => t.assigneeClientId === session.clientId);
      return response(200, { ok: true, tasks: mine }, origin);
    }
    return response(200, { ok: true, tasks: items }, origin);
  }

  if (method === 'POST') {
    if (session.role !== 'agency') return response(403, { ok: false, error: 'Forbidden' }, origin);
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    if (!payload.title || typeof payload.title !== 'string') {
      return badRequest(origin, 'title is required');
    }
    if (payload.status && !validateStatus(payload.status)) {
      return badRequest(origin, 'invalid status');
    }
    const id = payload.id || newId('task');
    const now = Date.now();
    const rec: TaskRecord = {
      PK: `AGENCY#${session.agencyId}`,
      SK: `TASK#${id}`,
      id,
      title: payload.title,
      description: payload.description,
      status: payload.status ?? 'todo',
      dueAt: Number.isFinite(payload.dueAt) ? Number(payload.dueAt) : undefined,
      assigneeClientId: payload.assigneeClientId ?? null,
      agencyId: session.agencyId,
      agencyEmail: session.agencyEmail,
      createdAt: now,
      updatedAt: now,
    };
    await putItem(rec);
    return response(200, { ok: true, task: rec }, origin);
  }

  if (method === 'PUT' || method === 'PATCH') {
    if (session.role !== 'agency') return response(403, { ok: false, error: 'Forbidden' }, origin);
    if (!taskId) return badRequest(origin, 'Missing task id');
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    if (payload.status && !validateStatus(payload.status)) {
      return badRequest(origin, 'invalid status');
    }
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `TASK#${taskId}` });
    if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);
    const now = Date.now();
    const merged: TaskRecord = {
      ...existing,
      ...payload,
      dueAt: payload.dueAt === null ? undefined : payload.dueAt ?? existing.dueAt,
      assigneeClientId: payload.assigneeClientId === undefined ? existing.assigneeClientId : payload.assigneeClientId ?? null,
      updatedAt: now,
    };
    await putItem(merged);
    return response(200, { ok: true, task: merged }, origin);
  }

  if (method === 'DELETE') {
    if (session.role !== 'agency') return response(403, { ok: false, error: 'Forbidden' }, origin);
    if (!taskId) return badRequest(origin, 'Missing task id');
    const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `TASK#${taskId}` });
    if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);
    await putItem({
      ...existing,
      deletedAt: new Date().toISOString(),
    });
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: `Method not allowed` }, origin);
};

