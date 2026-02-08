/**
 * Lambda handler for athlete notes (general notes, not coach-specific)
 */
import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { randomUUID } from 'crypto';
import { Handler } from './common';
import { response } from './cors';
import { putItem, getItem, queryByPK, queryByPKPaginated, deleteItem } from '../lib/dynamo';
import { parseSessionFromRequest } from '../lib/session';
import { withSentry } from '../lib/sentry';

export type NoteRecord = {
  PK: string;          // AGENCY#<agencyId>
  SK: string;          // NOTE#<noteId>
  GSI1PK?: string;     // ATHLETE#<athleteId> for athlete lookup
  GSI1SK?: string;     // NOTE#<noteId>
  id: string;
  athleteId: string;
  agencyId: string;
  agencyEmail: string;
  author?: string;
  title?: string;
  body: string;
  type?: 'recruiting' | 'account' | 'advice' | 'event' | 'other';
  createdAt: number;
  updatedAt: number;
  deletedAt?: string;  // Soft delete
};

const notesHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (method === 'OPTIONS') {
    return response(200, { ok: true }, origin);
  }

  const session = parseSessionFromRequest(event);
  if (!session?.agencyId) {
    return response(401, { ok: false, error: 'Unauthorized' }, origin);
  }

  const agencyId = session.agencyId;
  const agencyEmail = session.agencyEmail || session.agentEmail || '';
  const noteId = event.pathParameters?.id;

  // --- GET ---
  if (method === 'GET') {
    const qs = event.queryStringParameters || {};
    
    // Get single note by ID
    if (noteId) {
      const item = await getItem({ PK: `AGENCY#${agencyId}`, SK: `NOTE#${noteId}` });
      if (item?.deletedAt) {
        return response(404, { ok: false, error: 'Not found' }, origin);
      }
      return response(200, { ok: true, note: item ?? null }, origin);
    }

    // Paginated path
    if (qs.limit || qs.cursor) {
      const { items, nextCursor } = await queryByPKPaginated(`AGENCY#${agencyId}`, 'NOTE#', {
        limit: qs.limit ? parseInt(qs.limit, 10) : 50,
        cursor: qs.cursor || undefined,
      });
      let notes = (items as NoteRecord[]).filter(n => !n.deletedAt);
      if (qs.athleteId) {
        notes = notes.filter(n => n.athleteId === qs.athleteId);
      }
      notes.sort((a, b) => b.createdAt - a.createdAt);
      return response(200, { ok: true, notes, nextCursor }, origin);
    }
    
    // Legacy path
    let notes = (await queryByPK(`AGENCY#${agencyId}`, 'NOTE#')) as NoteRecord[];
    notes = notes.filter(n => !n.deletedAt);
    if (qs.athleteId) {
      notes = notes.filter(n => n.athleteId === qs.athleteId);
    }
    notes.sort((a, b) => b.createdAt - a.createdAt);
    
    return response(200, { ok: true, notes }, origin);
  }

  // --- POST ---
  if (method === 'POST') {
    if (!event.body) {
      return response(400, { ok: false, error: 'Missing body' }, origin);
    }
    
    const body = JSON.parse(event.body);
    const { athleteId, body: noteBody, title, type, author } = body;
    
    if (!athleteId || !noteBody?.trim()) {
      return response(400, { ok: false, error: 'athleteId and body are required' }, origin);
    }
    
    const id = randomUUID();
    const now = Date.now();
    
    const note: NoteRecord = {
      PK: `AGENCY#${agencyId}`,
      SK: `NOTE#${id}`,
      GSI1PK: `ATHLETE#${athleteId}`,
      GSI1SK: `NOTE#${id}`,
      id,
      athleteId,
      agencyId,
      agencyEmail,
      author: author || agencyEmail,
      title: title?.trim() || undefined,
      body: noteBody.trim(),
      type: type || 'other',
      createdAt: now,
      updatedAt: now,
    };
    
    await putItem(note);
    
    return response(201, { ok: true, note }, origin);
  }

  // --- PATCH ---
  if (method === 'PATCH') {
    if (!noteId) {
      return response(400, { ok: false, error: 'Note ID required' }, origin);
    }
    
    const existing = await getItem({ PK: `AGENCY#${agencyId}`, SK: `NOTE#${noteId}` }) as NoteRecord | undefined;
    if (!existing || existing.deletedAt) {
      return response(404, { ok: false, error: 'Note not found' }, origin);
    }
    
    const body = JSON.parse(event.body || '{}');
    const { title, body: noteBody, type } = body;
    
    const updated: NoteRecord = {
      ...existing,
      title: title !== undefined ? (title?.trim() || undefined) : existing.title,
      body: noteBody !== undefined ? noteBody.trim() : existing.body,
      type: type !== undefined ? type : existing.type,
      updatedAt: Date.now(),
    };
    
    await putItem(updated);
    
    return response(200, { ok: true, note: updated }, origin);
  }

  // --- DELETE ---
  if (method === 'DELETE') {
    if (!noteId) {
      return response(400, { ok: false, error: 'Note ID required' }, origin);
    }
    
    const existing = await getItem({ PK: `AGENCY#${agencyId}`, SK: `NOTE#${noteId}` }) as NoteRecord | undefined;
    if (!existing) {
      return response(404, { ok: false, error: 'Note not found' }, origin);
    }
    
    // Soft delete
    const softDeleted = {
      ...existing,
      deletedAt: new Date().toISOString(),
      updatedAt: Date.now(),
    };
    await putItem(softDeleted);
    
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(notesHandler);
