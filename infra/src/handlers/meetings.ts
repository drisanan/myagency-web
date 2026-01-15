/**
 * Meeting Requests API Handler
 * 
 * In-platform meeting scheduling between agents and athletes.
 * Supports request, confirm, decline, and cancel workflows.
 */

import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { MeetingRequestRecord, MeetingStatus, ClientRecord } from '../lib/models';
import { getItem, putItem, queryByPK, queryGSI3 } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';
import { logAuditEvent, extractAuditContext } from '../lib/audit';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

function getMeetingId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

const meetingsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const meetingId = getMeetingId(event);
  const agencyId = session.agencyId.trim();
  const qs = event.queryStringParameters || {};

  // --- GET ---
  if (method === 'GET') {
    // Get single meeting
    if (meetingId) {
      const item = await getItem({ PK: `AGENCY#${agencyId}`, SK: `MEETING#${meetingId}` }) as MeetingRequestRecord | undefined;
      
      // Verify access
      if (session.role === 'client' && item?.clientId !== session.clientId) {
        return response(403, { ok: false, error: 'Forbidden' }, origin);
      }
      
      return response(200, { ok: true, meeting: item ?? null }, origin);
    }
    
    let meetings: MeetingRequestRecord[] = [];
    
    // Filter by client
    if (qs.clientId) {
      if (session.role === 'client' && session.clientId !== qs.clientId) {
        return response(403, { ok: false, error: 'Forbidden' }, origin);
      }
      
      try {
        meetings = await queryGSI3(`CLIENT#${qs.clientId}`, 'MEETING#') as MeetingRequestRecord[];
      } catch {
        const all = await queryByPK(`AGENCY#${agencyId}`, 'MEETING#') as MeetingRequestRecord[];
        meetings = all.filter(m => m.clientId === qs.clientId);
      }
    } else {
      if (session.role === 'client') {
        // Clients can only see their own meetings
        try {
          meetings = await queryGSI3(`CLIENT#${session.clientId}`, 'MEETING#') as MeetingRequestRecord[];
        } catch {
          const all = await queryByPK(`AGENCY#${agencyId}`, 'MEETING#') as MeetingRequestRecord[];
          meetings = all.filter(m => m.clientId === session.clientId);
        }
      } else {
        meetings = await queryByPK(`AGENCY#${agencyId}`, 'MEETING#') as MeetingRequestRecord[];
      }
    }
    
    // Filter by status
    if (qs.status) {
      meetings = meetings.filter(m => m.status === qs.status);
    }
    
    // Filter upcoming only
    if (qs.upcoming === 'true') {
      const now = Date.now();
      meetings = meetings.filter(m => m.scheduledAt && m.scheduledAt >= now && m.status === 'confirmed');
    }
    
    // Sort by scheduled time or created time
    meetings.sort((a, b) => {
      if (a.scheduledAt && b.scheduledAt) return a.scheduledAt - b.scheduledAt;
      return b.createdAt - a.createdAt;
    });
    
    return response(200, { ok: true, meetings }, origin);
  }

  // --- POST (create meeting request) ---
  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    if (!payload.clientId || !payload.title) {
      return badRequest(origin, 'clientId and title are required');
    }
    
    // Verify client exists
    const client = await getItem({ PK: `AGENCY#${agencyId}`, SK: `CLIENT#${payload.clientId}` }) as ClientRecord | undefined;
    if (!client) return response(404, { ok: false, error: 'Client not found' }, origin);
    
    // Verify access for client role
    if (session.role === 'client' && session.clientId !== payload.clientId) {
      return response(403, { ok: false, error: 'Forbidden' }, origin);
    }
    
    const id = newId('mtg');
    const now = Date.now();
    
    const requestedBy = session.role === 'client' ? 'athlete' : 'agent';
    
    const rec: MeetingRequestRecord = {
      PK: `AGENCY#${agencyId}`,
      SK: `MEETING#${id}`,
      GSI3PK: `CLIENT#${payload.clientId}`,
      GSI3SK: `MEETING#${payload.scheduledAt || now}`,
      id,
      agencyId,
      clientId: payload.clientId,
      requestedBy,
      agentEmail: session.agentEmail || session.agencyEmail,
      athleteEmail: client.email,
      title: payload.title,
      description: payload.description,
      scheduledAt: payload.scheduledAt,
      proposedTimes: payload.proposedTimes,
      duration: payload.duration || 30,
      meetingLink: payload.meetingLink,
      status: payload.scheduledAt ? 'pending' : 'pending',
      notes: payload.notes,
      createdAt: now,
      updatedAt: now,
    };
    
    await putItem(rec);
    
    await logAuditEvent({
      session,
      action: 'meeting_request',
      targetType: 'meeting',
      targetId: id,
      targetName: payload.title,
      details: { clientId: payload.clientId, requestedBy },
      ...extractAuditContext(event),
    });
    
    return response(200, { ok: true, meeting: rec }, origin);
  }

  // --- PUT / PATCH (update meeting) ---
  if (method === 'PUT' || method === 'PATCH') {
    if (!meetingId) return badRequest(origin, 'Missing meeting id');
    if (!event.body) return badRequest(origin, 'Missing body');
    
    const payload = JSON.parse(event.body);
    const existing = await getItem({ PK: `AGENCY#${agencyId}`, SK: `MEETING#${meetingId}` }) as MeetingRequestRecord | undefined;
    
    if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);
    
    // Verify access
    if (session.role === 'client' && existing.clientId !== session.clientId) {
      return response(403, { ok: false, error: 'Forbidden' }, origin);
    }
    
    // Status transition validation
    const validTransitions: Record<MeetingStatus, MeetingStatus[]> = {
      pending: ['confirmed', 'declined', 'cancelled'],
      confirmed: ['cancelled', 'completed'],
      declined: ['pending'],
      cancelled: ['pending'],
      completed: [],
    };
    
    if (payload.status && !validTransitions[existing.status].includes(payload.status)) {
      return badRequest(origin, `Cannot transition from ${existing.status} to ${payload.status}`);
    }
    
    const now = Date.now();
    const merged: MeetingRequestRecord = {
      ...existing,
      title: payload.title ?? existing.title,
      description: payload.description ?? existing.description,
      scheduledAt: payload.scheduledAt ?? existing.scheduledAt,
      proposedTimes: payload.proposedTimes ?? existing.proposedTimes,
      duration: payload.duration ?? existing.duration,
      meetingLink: payload.meetingLink ?? existing.meetingLink,
      status: (payload.status ?? existing.status) as MeetingStatus,
      notes: payload.notes ?? existing.notes,
      updatedAt: now,
    };
    
    // Update GSI3SK if scheduled time changed
    if (payload.scheduledAt && payload.scheduledAt !== existing.scheduledAt) {
      merged.GSI3SK = `MEETING#${payload.scheduledAt}`;
    }
    
    await putItem(merged);
    
    // Map status changes to specific audit actions
    const statusActionMap: Record<string, 'meeting_update' | 'meeting_confirmed' | 'meeting_declined' | 'meeting_cancelled' | 'meeting_completed'> = {
      confirmed: 'meeting_confirmed',
      declined: 'meeting_declined',
      cancelled: 'meeting_cancelled',
      completed: 'meeting_completed',
    };
    const auditAction = payload.status ? (statusActionMap[payload.status] || 'meeting_update') : 'meeting_update';
    
    await logAuditEvent({
      session,
      action: auditAction,
      targetType: 'meeting',
      targetId: meetingId,
      details: { status: merged.status },
      ...extractAuditContext(event),
    });
    
    return response(200, { ok: true, meeting: merged }, origin);
  }

  // --- DELETE (cancel meeting) ---
  if (method === 'DELETE') {
    if (!meetingId) return badRequest(origin, 'Missing meeting id');
    
    const existing = await getItem({ PK: `AGENCY#${agencyId}`, SK: `MEETING#${meetingId}` }) as MeetingRequestRecord | undefined;
    if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);
    
    // Verify access
    if (session.role === 'client' && existing.clientId !== session.clientId) {
      return response(403, { ok: false, error: 'Forbidden' }, origin);
    }
    
    const now = Date.now();
    await putItem({
      ...existing,
      status: 'cancelled',
      updatedAt: now,
    });
    
    await logAuditEvent({
      session,
      action: 'meeting_cancel',
      targetType: 'meeting',
      targetId: meetingId,
      ...extractAuditContext(event),
    });
    
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(meetingsHandler);
