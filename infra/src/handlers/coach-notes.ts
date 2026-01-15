/**
 * Coach Notes API Handler
 * 
 * Notes associated with coaches/schools, not just athletes.
 * Supports filtering by coach email, university, or athlete context.
 */

import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { CoachNoteRecord } from '../lib/models';
import { getItem, putItem, queryByPK, queryGSI2 } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';
import { logAuditEvent, extractAuditContext } from '../lib/audit';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

function getNoteId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

const coachNotesHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  // Only agents can manage coach notes
  if (session.role !== 'agency' && session.role !== 'agent') {
    return response(403, { ok: false, error: 'Forbidden' }, origin);
  }

  const noteId = getNoteId(event);
  const agencyId = session.agencyId.trim();

  // --- GET ---
  if (method === 'GET') {
    const qs = event.queryStringParameters || {};
    
    // Get single note by ID
    if (noteId) {
      const item = await getItem({ PK: `AGENCY#${agencyId}`, SK: `COACH_NOTE#${noteId}` }) as CoachNoteRecord | undefined;
      // Don't return deleted items
      if (item?.deletedAt) {
        return response(404, { ok: false, error: 'Not found' }, origin);
      }
      return response(200, { ok: true, note: item ?? null }, origin);
    }
    
    // List notes with optional filters
    let notes: CoachNoteRecord[] = [];
    
    // Filter by coach email
    if (qs.coachEmail) {
      notes = await queryGSI2(`COACH#${qs.coachEmail}`, 'COACH_NOTE#') as CoachNoteRecord[];
    } else {
      // Get all coach notes for agency
      notes = await queryByPK(`AGENCY#${agencyId}`, 'COACH_NOTE#') as CoachNoteRecord[];
    }
    
    // Filter out soft-deleted notes
    notes = notes.filter(n => !n.deletedAt);
    
    // Additional in-memory filters
    if (qs.university) {
      notes = notes.filter(n => n.university?.toLowerCase() === qs.university?.toLowerCase());
    }
    if (qs.athleteId) {
      notes = notes.filter(n => n.athleteId === qs.athleteId);
    }
    
    // Sort by createdAt descending
    notes.sort((a, b) => b.createdAt - a.createdAt);
    
    return response(200, { ok: true, notes }, origin);
  }

  // --- POST ---
  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    if (!payload.coachEmail || !payload.body) {
      return badRequest(origin, 'coachEmail and body are required');
    }
    
    const id = newId('cnote');
    const now = Date.now();
    
    const rec: CoachNoteRecord = {
      PK: `AGENCY#${agencyId}`,
      SK: `COACH_NOTE#${id}`,
      GSI2PK: `COACH#${payload.coachEmail}`,
      GSI2SK: `COACH_NOTE#${id}`,
      id,
      agencyId,
      agencyEmail: session.agencyEmail,
      coachEmail: payload.coachEmail,
      coachName: payload.coachName,
      university: payload.university,
      athleteId: payload.athleteId,
      author: session.agentEmail || session.agencyEmail || 'unknown',
      title: payload.title,
      body: payload.body,
      type: payload.type || 'other',
      createdAt: now,
      updatedAt: now,
    };
    
    await putItem(rec);
    
    // Audit log
    await logAuditEvent({
      session,
      action: 'coach_note_create',
      targetType: 'coach_note',
      targetId: id,
      targetName: `${payload.coachName || payload.coachEmail} - ${payload.university || 'Unknown'}`,
      ...extractAuditContext(event),
    });
    
    return response(200, { ok: true, note: rec }, origin);
  }

  // --- PUT / PATCH ---
  if (method === 'PUT' || method === 'PATCH') {
    if (!noteId) return badRequest(origin, 'Missing note id');
    if (!event.body) return badRequest(origin, 'Missing body');
    
    const payload = JSON.parse(event.body);
    const existing = await getItem({ PK: `AGENCY#${agencyId}`, SK: `COACH_NOTE#${noteId}` }) as CoachNoteRecord | undefined;
    
    if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);
    
    const now = Date.now();
    const merged: CoachNoteRecord = {
      ...existing,
      title: payload.title ?? existing.title,
      body: payload.body ?? existing.body,
      type: payload.type ?? existing.type,
      coachName: payload.coachName ?? existing.coachName,
      university: payload.university ?? existing.university,
      updatedAt: now,
    };
    
    await putItem(merged);
    
    await logAuditEvent({
      session,
      action: 'coach_note_update',
      targetType: 'coach_note',
      targetId: noteId,
      ...extractAuditContext(event),
    });
    
    return response(200, { ok: true, note: merged }, origin);
  }

  // --- DELETE ---
  if (method === 'DELETE') {
    if (!noteId) return badRequest(origin, 'Missing note id');
    
    const existing = await getItem({ PK: `AGENCY#${agencyId}`, SK: `COACH_NOTE#${noteId}` }) as CoachNoteRecord | undefined;
    if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);
    
    await putItem({
      ...existing,
      deletedAt: new Date().toISOString(),
    });
    
    await logAuditEvent({
      session,
      action: 'coach_note_delete',
      targetType: 'coach_note',
      targetId: noteId,
      ...extractAuditContext(event),
    });
    
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(coachNotesHandler);
