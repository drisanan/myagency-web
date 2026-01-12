/**
 * Backend Audit Logging Utility
 * Tracks all actions performed by agents (and other users) for accountability
 * Stored in DynamoDB for long-term retention and reporting
 */

import { putItem, queryByPK } from './dynamo';
import { SessionContext } from './models';

export type AuditAction =
  | 'agent_login'
  | 'client_create'
  | 'client_update'
  | 'client_delete'
  | 'agent_create'
  | 'agent_update'
  | 'agent_delete'
  | 'list_create'
  | 'list_update'
  | 'list_delete'
  | 'task_create'
  | 'task_update'
  | 'task_delete'
  | 'note_create'
  | 'note_update'
  | 'note_delete'
  | 'settings_update'
  | 'prompt_update'
  | 'recruiter_action'
  | 'other';

export type AuditRecord = {
  PK: string;              // AGENCY#<agencyId>
  SK: string;              // AUDIT#<timestamp>#<id>
  id: string;
  agencyId: string;
  action: AuditAction;
  actorType: 'agency' | 'agent' | 'client' | 'system';
  actorId?: string;        // Agent ID or other actor ID
  actorEmail: string;
  targetType?: string;     // e.g., 'client', 'agent', 'list'
  targetId?: string;
  targetName?: string;     // Human-readable target name
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: number;
};

/**
 * Log an audit event
 */
export async function logAuditEvent(params: {
  session: SessionContext;
  action: AuditAction;
  targetType?: string;
  targetId?: string;
  targetName?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuditRecord> {
  const { session, action, targetType, targetId, targetName, details, ipAddress, userAgent } = params;
  
  const timestamp = Date.now();
  const id = `${timestamp}-${Math.random().toString(36).slice(2, 10)}`;
  
  // Determine actor type and ID
  let actorType: AuditRecord['actorType'] = 'agency';
  let actorId: string | undefined;
  let actorEmail = session.agencyEmail || '';
  
  if (session.role === 'agent' && session.agentId) {
    actorType = 'agent';
    actorId = session.agentId;
    actorEmail = session.agentEmail || actorEmail;
  } else if (session.role === 'client' && session.clientId) {
    actorType = 'client';
    actorId = session.clientId;
  }
  
  const record: AuditRecord = {
    PK: `AGENCY#${session.agencyId}`,
    SK: `AUDIT#${timestamp}#${id}`,
    id,
    agencyId: session.agencyId,
    action,
    actorType,
    actorId,
    actorEmail,
    targetType,
    targetId,
    targetName,
    details,
    ipAddress,
    userAgent,
    timestamp,
  };
  
  try {
    await putItem(record);
    console.log(`[Audit] ${actorType}:${actorEmail} performed ${action} on ${targetType || 'N/A'}:${targetId || 'N/A'}`);
  } catch (err) {
    console.error('[Audit] Failed to log event:', err);
    // Don't throw - audit logging should never break the main operation
  }
  
  return record;
}

/**
 * Get audit log for an agency
 * Returns most recent first (by timestamp descending)
 */
export async function getAgencyAuditLog(
  agencyId: string,
  limit: number = 100
): Promise<AuditRecord[]> {
  try {
    const items = await queryByPK(`AGENCY#${agencyId}`, 'AUDIT#');
    // Sort by timestamp descending (most recent first)
    return (items as AuditRecord[])
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  } catch (err) {
    console.error('[Audit] Failed to fetch log:', err);
    return [];
  }
}

/**
 * Helper to extract audit context from API event
 */
export function extractAuditContext(event: { headers?: Record<string, string> }): {
  ipAddress?: string;
  userAgent?: string;
} {
  const headers = event.headers || {};
  return {
    ipAddress: headers['x-forwarded-for']?.split(',')[0]?.trim() || headers['x-real-ip'],
    userAgent: headers['user-agent'],
  };
}
