/**
 * Communications Hub API Handler
 * 
 * Central hub for all agent-athlete-coach communications.
 * Supports threaded conversations and filtering.
 */

import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { CommunicationRecord, CommunicationType } from '../lib/models';
import { getItem, putItem, queryByPK, queryGSI2, queryGSI3 } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';
import { logAuditEvent, extractAuditContext } from '../lib/audit';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

function getCommId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

const communicationsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const commId = getCommId(event);
  const agencyId = session.agencyId.trim();

  // --- GET ---
  if (method === 'GET') {
    const qs = event.queryStringParameters || {};
    
    // Get single communication by ID
    if (commId) {
      const items = await queryByPK(`AGENCY#${agencyId}`, `COMM#`);
      const item = items.find((i: any) => i.id === commId);
      
      // Verify access
      if (session.role === 'client' && item?.athleteId !== session.clientId) {
        return response(403, { ok: false, error: 'Forbidden' }, origin);
      }
      
      return response(200, { ok: true, communication: item ?? null }, origin);
    }
    
    let communications: CommunicationRecord[] = [];
    
    // Filter by thread
    if (qs.threadId) {
      try {
        communications = await queryGSI2(`THREAD#${qs.threadId}`, 'COMM#') as CommunicationRecord[];
      } catch {
        // Fallback: filter in memory
        const all = await queryByPK(`AGENCY#${agencyId}`, 'COMM#') as CommunicationRecord[];
        communications = all.filter(c => c.threadId === qs.threadId);
      }
    }
    // Filter by athlete (client)
    else if (qs.clientId || qs.athleteId) {
      const clientId = qs.clientId || qs.athleteId;
      try {
        communications = await queryGSI3(`CLIENT#${clientId}`, 'COMM#') as CommunicationRecord[];
      } catch {
        const all = await queryByPK(`AGENCY#${agencyId}`, 'COMM#') as CommunicationRecord[];
        communications = all.filter(c => c.athleteId === clientId);
      }
    }
    // Get all communications for agency
    else {
      communications = await queryByPK(`AGENCY#${agencyId}`, 'COMM#') as CommunicationRecord[];
    }
    
    // Additional filters
    if (qs.type) {
      communications = communications.filter(c => c.type === qs.type);
    }
    if (qs.coachEmail) {
      communications = communications.filter(c => c.coachEmail === qs.coachEmail);
    }
    
    // Client role: only see their own communications
    if (session.role === 'client') {
      communications = communications.filter(c => c.athleteId === session.clientId);
    }
    
    // Sort by createdAt descending
    communications.sort((a, b) => b.createdAt - a.createdAt);
    
    // Limit results
    const limit = parseInt(qs.limit || '100', 10);
    communications = communications.slice(0, limit);
    
    return response(200, { ok: true, communications }, origin);
  }

  // --- POST ---
  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    if (!payload.type || !payload.toEmail || !payload.body) {
      return badRequest(origin, 'type, toEmail, and body are required');
    }
    
    // Validate communication type based on role
    const validTypes: CommunicationType[] = [];
    if (session.role === 'agency' || session.role === 'agent') {
      validTypes.push('agent_to_athlete', 'agent_to_coach');
    }
    if (session.role === 'client') {
      validTypes.push('athlete_to_agent', 'athlete_to_coach');
    }
    
    if (!validTypes.includes(payload.type as CommunicationType)) {
      return badRequest(origin, `Invalid communication type for your role. Allowed: ${validTypes.join(', ')}`);
    }
    
    const id = newId('comm');
    const now = Date.now();
    
    // Determine from email based on role
    const fromEmail = session.agentEmail || session.agencyEmail || (session as any).email;
    
    const rec: CommunicationRecord = {
      PK: `AGENCY#${agencyId}`,
      SK: `COMM#${now}#${id}`,
      GSI2PK: payload.threadId ? `THREAD#${payload.threadId}` : undefined,
      GSI2SK: payload.threadId ? `COMM#${now}` : undefined,
      GSI3PK: payload.athleteId ? `CLIENT#${payload.athleteId}` : undefined,
      GSI3SK: payload.athleteId ? `COMM#${now}` : undefined,
      id,
      agencyId,
      threadId: payload.threadId || id, // Use id as threadId if not replying
      type: payload.type as CommunicationType,
      fromEmail,
      fromName: payload.fromName || session.firstName ? `${session.firstName} ${session.lastName || ''}`.trim() : undefined,
      toEmail: payload.toEmail,
      toName: payload.toName,
      athleteId: payload.athleteId,
      coachEmail: payload.coachEmail,
      university: payload.university,
      subject: payload.subject,
      body: payload.body,
      isRead: false,
      attachments: payload.attachments,
      createdAt: now,
    };
    
    await putItem(rec);
    
    await logAuditEvent({
      session,
      action: 'communication_send',
      targetType: 'communication',
      targetId: id,
      details: { type: payload.type, toEmail: payload.toEmail },
      ...extractAuditContext(event),
    });
    
    return response(200, { ok: true, communication: rec }, origin);
  }

  // --- PATCH (mark as read) ---
  if (method === 'PATCH') {
    if (!commId) return badRequest(origin, 'Missing communication id');
    if (!event.body) return badRequest(origin, 'Missing body');
    
    const payload = JSON.parse(event.body);
    
    // Find the communication
    const items = await queryByPK(`AGENCY#${agencyId}`, 'COMM#') as CommunicationRecord[];
    const existing = items.find(c => c.id === commId);
    
    if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);
    
    // Verify access
    if (session.role === 'client' && existing.athleteId !== session.clientId) {
      return response(403, { ok: false, error: 'Forbidden' }, origin);
    }
    
    const merged = {
      ...existing,
      isRead: payload.isRead ?? existing.isRead,
    };
    
    await putItem(merged);
    
    return response(200, { ok: true, communication: merged }, origin);
  }

  return response(405, { ok: false, error: 'Method not allowed' }, origin);
};

export const handler = withSentry(communicationsHandler);

// ============================================
// Get Threads Endpoint
// ============================================

const threadsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method !== 'GET') return response(405, { ok: false, error: 'Method not allowed' }, origin);
  
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const agencyId = session.agencyId.trim();
  const qs = event.queryStringParameters || {};
  
  // Get all communications
  let communications = await queryByPK(`AGENCY#${agencyId}`, 'COMM#') as CommunicationRecord[];
  
  // Filter for client role
  if (session.role === 'client') {
    communications = communications.filter(c => c.athleteId === session.clientId);
  }
  
  // Filter by athlete if specified
  if (qs.athleteId) {
    communications = communications.filter(c => c.athleteId === qs.athleteId);
  }
  
  // Group by thread
  const threadMap = new Map<string, CommunicationRecord[]>();
  for (const comm of communications) {
    const threadId = comm.threadId || comm.id;
    if (!threadMap.has(threadId)) {
      threadMap.set(threadId, []);
    }
    threadMap.get(threadId)!.push(comm);
  }
  
  // Build thread summaries
  const threads = Array.from(threadMap.entries()).map(([threadId, messages]) => {
    messages.sort((a, b) => a.createdAt - b.createdAt);
    const first = messages[0];
    const last = messages[messages.length - 1];
    const unreadCount = messages.filter(m => !m.isRead).length;
    
    return {
      threadId,
      subject: first.subject || '(No subject)',
      participants: [...new Set(messages.flatMap(m => [m.fromEmail, m.toEmail]))],
      athleteId: first.athleteId,
      coachEmail: first.coachEmail,
      university: first.university,
      messageCount: messages.length,
      unreadCount,
      lastMessage: {
        id: last.id,
        fromEmail: last.fromEmail,
        body: last.body.slice(0, 100) + (last.body.length > 100 ? '...' : ''),
        createdAt: last.createdAt,
      },
      createdAt: first.createdAt,
      updatedAt: last.createdAt,
    };
  });
  
  // Sort by most recent message
  threads.sort((a, b) => b.updatedAt - a.updatedAt);
  
  return response(200, { ok: true, threads }, origin);
};

export const getThreadsHandler = withSentry(threadsHandler);
