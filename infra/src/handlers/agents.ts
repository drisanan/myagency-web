import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { AgentRecord, AgencyRecord, STARTER_USER_LIMIT } from '../lib/models';
import { getItem, putItem, queryByPK, deleteItem } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';
import { hashAccessCode } from '../lib/auth';
import { logAuditEvent, extractAuditContext } from '../lib/audit';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

function getAgentId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

const agentsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  // Handle OPTIONS for CORS Preflight
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  // Validate Session
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);
  
  // Only agency owners can manage agents, not agents themselves
  if (session.role === 'agent') {
    return response(403, { ok: false, error: 'Agents cannot manage other agents' }, origin);
  }

  const cleanAgencyId = session.agencyId.trim();
  const agentId = getAgentId(event);

  // Helper to strip sensitive fields
  const stripSensitive = (agent: any) => {
    if (!agent) return null;
    const { accessCodeHash, ...safe } = agent;
    return safe;
  };

  // --- GET ---
  if (method === 'GET') {
    // A. Get Single Agent
    if (agentId) {
      const item = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: `AGENT#${agentId}` });
      return response(200, { ok: true, agent: stripSensitive(item) }, origin);
    }
    
    // B. List All Agents for Agency
    const pk = `AGENCY#${cleanAgencyId}`;
    const items = await queryByPK(pk, 'AGENT#');
    
    // Filter out deleted agents and strip sensitive fields
    const activeAgents = items.filter((a: any) => !a.deletedAt).map(stripSensitive);
    
    return response(200, { ok: true, agents: activeAgents }, origin);
  }

  // --- POST ---
  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    if (!payload.email || !payload.firstName || !payload.lastName) {
      return badRequest(origin, 'email, firstName, lastName are required');
    }

    // --- TIER LIMIT ENFORCEMENT ---
    const agency = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: 'PROFILE' }) as AgencyRecord | undefined;
    const subscriptionLevel = agency?.subscriptionLevel || 'starter';

    if (subscriptionLevel !== 'unlimited') {
      const existingClients = await queryByPK(`AGENCY#${cleanAgencyId}`, 'CLIENT#');
      const activeClients = existingClients.filter((c: any) => !c.deletedAt);
      
      const existingAgents = await queryByPK(`AGENCY#${cleanAgencyId}`, 'AGENT#');
      const activeAgents = existingAgents.filter((a: any) => !a.deletedAt);
      
      const totalUsers = activeClients.length + activeAgents.length;
      
      if (totalUsers >= STARTER_USER_LIMIT) {
        return response(403, { 
          ok: false, 
          error: `User limit reached. Please upgrade to Unlimited to add more than ${STARTER_USER_LIMIT} users.`,
          code: 'USER_LIMIT_REACHED',
          currentCount: totalUsers,
          limit: STARTER_USER_LIMIT
        }, origin);
      }
    }
    // --- END TIER LIMIT ENFORCEMENT ---
    
    const id = payload.id || newId('agent');
    const now = Date.now();
    
    // Hash access code if provided
    let accessCodeHash: string | undefined;
    if (payload.accessCode) {
      accessCodeHash = await hashAccessCode(payload.accessCode);
    }
    
    const rec: AgentRecord = {
      PK: `AGENCY#${cleanAgencyId}`,
      SK: `AGENT#${id}`,
      id,
      agencyId: cleanAgencyId,
      agencyEmail: session.agencyEmail,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      phone: payload.phone,
      role: payload.role,
      accessCodeHash,
      authEnabled: payload.authEnabled ?? false,
      createdAt: now,
      updatedAt: now,
    };
    
    await putItem(rec);
    
    // Audit log: agent created
    await logAuditEvent({
      session,
      action: 'agent_create',
      targetType: 'agent',
      targetId: id,
      targetName: `${payload.firstName} ${payload.lastName}`,
      ...extractAuditContext(event),
    });
    
    // Return agent without sensitive fields
    const { accessCodeHash: _, ...safeAgent } = rec;
    return response(200, { ok: true, agent: safeAgent }, origin);
  }

  // --- PUT / PATCH ---
  if (method === 'PUT' || method === 'PATCH') {
    if (!agentId) return badRequest(origin, 'Missing agent id');
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    const existing = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: `AGENT#${agentId}` }) as AgentRecord | undefined;
    if (!existing) return response(404, { ok: false, message: 'Not found' }, origin);
    
    const now = Date.now();
    
    // Hash access code if provided (update password)
    let accessCodeHash = existing.accessCodeHash;
    if (payload.accessCode) {
      accessCodeHash = await hashAccessCode(payload.accessCode);
    }
    
    // Remove accessCode from payload to prevent storing plaintext
    const { accessCode: _, ...safePayload } = payload;
    
    const merged: AgentRecord = { 
      ...existing, 
      ...safePayload,
      accessCodeHash,
      updatedAt: now,
    };
    
    await putItem(merged);
    
    // Audit log: agent updated
    await logAuditEvent({
      session,
      action: 'agent_update',
      targetType: 'agent',
      targetId: agentId,
      targetName: `${merged.firstName} ${merged.lastName}`,
      details: { fieldsUpdated: Object.keys(safePayload) },
      ...extractAuditContext(event),
    });
    
    // Return agent without sensitive fields
    const { accessCodeHash: __, ...safeAgent } = merged;
    return response(200, { ok: true, agent: safeAgent }, origin);
  }

  // --- DELETE ---
  if (method === 'DELETE') {
    if (!agentId) return response(400, { ok: false, error: 'Missing agent id' }, origin);
    
    const existing = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: `AGENT#${agentId}` }) as AgentRecord | undefined;
    if (existing) {
      // Soft delete
      await putItem({
        ...existing,
        deletedAt: new Date().toISOString(),
      });
      
      // Audit log: agent deleted
      await logAuditEvent({
        session,
        action: 'agent_delete',
        targetType: 'agent',
        targetId: agentId,
        targetName: `${existing.firstName} ${existing.lastName}`,
        ...extractAuditContext(event),
      });
    }
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: `Method not allowed` }, origin);
};

export const handler = withSentry(agentsHandler);

