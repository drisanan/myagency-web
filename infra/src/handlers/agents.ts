import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { AgentRecord } from '../lib/models';
import { getItem, putItem, queryByPK, deleteItem } from '../lib/dynamo';
import { response } from './cors';
import { withSentry } from '../lib/sentry';

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

  const cleanAgencyId = session.agencyId.trim();
  const agentId = getAgentId(event);

  // --- GET ---
  if (method === 'GET') {
    // A. Get Single Agent
    if (agentId) {
      const item = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: `AGENT#${agentId}` });
      return response(200, { ok: true, agent: item ?? null }, origin);
    }
    
    // B. List All Agents for Agency
    const pk = `AGENCY#${cleanAgencyId}`;
    const items = await queryByPK(pk, 'AGENT#');
    
    // Filter out deleted agents
    const activeAgents = items.filter((a: any) => !a.deletedAt);
    
    return response(200, { ok: true, agents: activeAgents }, origin);
  }

  // --- POST ---
  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    if (!payload.email || !payload.firstName || !payload.lastName) {
      return badRequest(origin, 'email, firstName, lastName are required');
    }
    
    const id = payload.id || newId('agent');
    const now = Date.now();
    
    const rec: AgentRecord = {
      PK: `AGENCY#${cleanAgencyId}`,
      SK: `AGENT#${id}`,
      id,
      agencyId: cleanAgencyId,
      agencyEmail: session.agencyEmail,
      firstName: payload.firstName,
      lastName: payload.lastName,
      email: payload.email,
      role: payload.role,
      createdAt: now,
      updatedAt: now,
    };
    
    await putItem(rec);
    return response(200, { ok: true, agent: rec }, origin);
  }

  // --- PUT / PATCH ---
  if (method === 'PUT' || method === 'PATCH') {
    if (!agentId) return badRequest(origin, 'Missing agent id');
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    const existing = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: `AGENT#${agentId}` }) as AgentRecord | undefined;
    if (!existing) return response(404, { ok: false, message: 'Not found' }, origin);
    
    const now = Date.now();
    
    const merged: AgentRecord = { 
      ...existing, 
      ...payload, 
      updatedAt: now,
    };
    
    await putItem(merged);
    return response(200, { ok: true, agent: merged }, origin);
  }

  // --- DELETE ---
  if (method === 'DELETE') {
    if (!agentId) return response(400, { ok: false, error: 'Missing agent id' }, origin);
    
    const existing = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: `AGENT#${agentId}` });
    if (existing) {
      // Soft delete
      await putItem({
        ...existing,
        deletedAt: new Date().toISOString(),
      });
    }
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: `Method not allowed` }, origin);
};

export const handler = withSentry(agentsHandler);

