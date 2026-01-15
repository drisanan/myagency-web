/**
 * Task Templates API Handler
 * 
 * Reusable task groups that can be assigned to athletes.
 * Supports auto-assignment based on program level.
 */

import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { TaskTemplateRecord, TaskRecord, ProgramLevel } from '../lib/models';
import { getItem, putItem, queryByPK } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';
import { logAuditEvent, extractAuditContext } from '../lib/audit';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

function getTemplateId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

const taskTemplatesHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  // Only agents can manage task templates
  if (session.role !== 'agency' && session.role !== 'agent') {
    return response(403, { ok: false, error: 'Forbidden' }, origin);
  }

  const templateId = getTemplateId(event);
  const agencyId = session.agencyId.trim();

  // --- GET ---
  if (method === 'GET') {
    const qs = event.queryStringParameters || {};
    
    // Get single template by ID
    if (templateId) {
      const item = await getItem({ PK: `AGENCY#${agencyId}`, SK: `TASK_TEMPLATE#${templateId}` });
      return response(200, { ok: true, template: item ?? null }, origin);
    }
    
    // List all templates
    let templates = await queryByPK(`AGENCY#${agencyId}`, 'TASK_TEMPLATE#') as TaskTemplateRecord[];
    
    // Filter out deleted
    templates = templates.filter(t => !t.deletedAt);
    
    // Filter by program level if specified
    if (qs.programLevel) {
      templates = templates.filter(t => t.programLevel === qs.programLevel);
    }
    
    // Sort by name
    templates.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    
    return response(200, { ok: true, templates }, origin);
  }

  // --- POST ---
  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    if (!payload.name || !Array.isArray(payload.tasks) || payload.tasks.length === 0) {
      return badRequest(origin, 'name and tasks array are required');
    }
    
    const id = newId('tmpl');
    const now = Date.now();
    
    const rec: TaskTemplateRecord = {
      PK: `AGENCY#${agencyId}`,
      SK: `TASK_TEMPLATE#${id}`,
      id,
      agencyId,
      agencyEmail: session.agencyEmail,
      name: payload.name,
      description: payload.description,
      programLevel: payload.programLevel as ProgramLevel | undefined,
      tasks: payload.tasks,
      createdAt: now,
      updatedAt: now,
    };
    
    await putItem(rec);
    
    await logAuditEvent({
      session,
      action: 'task_template_create',
      targetType: 'task_template',
      targetId: id,
      targetName: payload.name,
      ...extractAuditContext(event),
    });
    
    return response(200, { ok: true, template: rec }, origin);
  }

  // --- PUT / PATCH ---
  if (method === 'PUT' || method === 'PATCH') {
    if (!templateId) return badRequest(origin, 'Missing template id');
    if (!event.body) return badRequest(origin, 'Missing body');
    
    const payload = JSON.parse(event.body);
    const existing = await getItem({ PK: `AGENCY#${agencyId}`, SK: `TASK_TEMPLATE#${templateId}` }) as TaskTemplateRecord | undefined;
    
    if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);
    
    const now = Date.now();
    const merged: TaskTemplateRecord = {
      ...existing,
      name: payload.name ?? existing.name,
      description: payload.description ?? existing.description,
      programLevel: payload.programLevel ?? existing.programLevel,
      tasks: payload.tasks ?? existing.tasks,
      updatedAt: now,
    };
    
    await putItem(merged);
    
    await logAuditEvent({
      session,
      action: 'task_template_update',
      targetType: 'task_template',
      targetId: templateId,
      ...extractAuditContext(event),
    });
    
    return response(200, { ok: true, template: merged }, origin);
  }

  // --- DELETE ---
  if (method === 'DELETE') {
    if (!templateId) return badRequest(origin, 'Missing template id');
    
    const existing = await getItem({ PK: `AGENCY#${agencyId}`, SK: `TASK_TEMPLATE#${templateId}` }) as TaskTemplateRecord | undefined;
    if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);
    
    await putItem({
      ...existing,
      deletedAt: new Date().toISOString(),
    });
    
    await logAuditEvent({
      session,
      action: 'task_template_delete',
      targetType: 'task_template',
      targetId: templateId,
      ...extractAuditContext(event),
    });
    
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(taskTemplatesHandler);

// ============================================
// Apply Template Endpoint
// ============================================

const applyTemplateHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);
  
  if (session.role !== 'agency' && session.role !== 'agent') {
    return response(403, { ok: false, error: 'Forbidden' }, origin);
  }

  if (method !== 'POST') return response(405, { ok: false, error: 'Method not allowed' }, origin);
  if (!event.body) return badRequest(origin, 'Missing body');
  
  const payload = JSON.parse(event.body);
  const { templateId, clientId } = payload;
  
  if (!templateId || !clientId) {
    return badRequest(origin, 'templateId and clientId are required');
  }
  
  const agencyId = session.agencyId.trim();
  
  // Get the template
  const template = await getItem({ PK: `AGENCY#${agencyId}`, SK: `TASK_TEMPLATE#${templateId}` }) as TaskTemplateRecord | undefined;
  if (!template) return response(404, { ok: false, error: 'Template not found' }, origin);
  
  // Verify client exists
  const client = await getItem({ PK: `AGENCY#${agencyId}`, SK: `CLIENT#${clientId}` });
  if (!client) return response(404, { ok: false, error: 'Client not found' }, origin);
  
  const now = Date.now();
  const createdTasks: TaskRecord[] = [];
  
  // Create tasks from template
  for (const taskItem of template.tasks) {
    const taskId = newId('task');
    const dueAt = taskItem.daysFromAssignment 
      ? now + (taskItem.daysFromAssignment * 24 * 60 * 60 * 1000)
      : undefined;
    
    const task: TaskRecord = {
      PK: `AGENCY#${agencyId}`,
      SK: `TASK#${taskId}`,
      id: taskId,
      title: taskItem.title,
      description: taskItem.description,
      status: 'todo',
      dueAt,
      assigneeClientId: clientId,
      agencyId,
      agencyEmail: session.agencyEmail,
      createdAt: now,
      updatedAt: now,
    };
    
    await putItem(task);
    createdTasks.push(task);
  }
  
  await logAuditEvent({
    session,
    action: 'task_template_apply',
    targetType: 'client',
    targetId: clientId,
    details: { templateId, tasksCreated: createdTasks.length },
    ...extractAuditContext(event),
  });
  
  return response(200, { 
    ok: true, 
    tasks: createdTasks,
    message: `Applied ${createdTasks.length} tasks from template "${template.name}"`,
  }, origin);
};

export const applyHandler = withSentry(applyTemplateHandler);
