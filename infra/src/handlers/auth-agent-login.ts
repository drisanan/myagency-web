import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler } from './common';
import { response } from './cors';
import { queryByPK, getItem, putItem } from '../lib/dynamo';
import { encodeSession, buildSessionCookie } from '../lib/session';
import { verifyAccessCode } from '../lib/auth';
import { withSentry } from '../lib/sentry';
import { AgentRecord, AgencyRecord } from '../lib/models';

function normalizeEmail(email: string) {
  return String(email || '').trim().toLowerCase();
}

function normalizePhone(phone: string) {
  return String(phone || '').trim();
}

const authAgentLoginHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const headers = event.headers || {};
  const origin = headers.origin || headers.Origin || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  // Detect localhost for cookie settings
  const host = headers['x-forwarded-host'] || headers.host || headers.Host || '';
  const proto = headers['x-forwarded-proto'] || 'https';
  const resolvedOrigin = origin || `${proto}://${host}`;
  const isLocal = resolvedOrigin.includes('localhost');
  const secureCookie = proto === 'https' && !isLocal;
  
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method !== 'POST') return response(405, { ok: false, error: 'Method not allowed' }, origin);
  if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);

  const { email, accessCode, phone } = JSON.parse(event.body || '{}');
  console.log('[auth-agent-login] request', {
    email,
    phone: String(phone),
    accessLen: accessCode ? String(accessCode).length : 0,
  });
  
  if (!email || !accessCode || !phone) {
    return response(400, { ok: false, error: 'email, accessCode, phone are required' }, origin);
  }

  const normalizedEmail = normalizeEmail(email);
  const accessString = String(accessCode).trim();
  const phoneString = normalizePhone(phone);

  // Find agent by email - need to scan all agencies' agents
  // First, try to find which agency this agent belongs to via a broader search
  // Since agents are stored under AGENCY#<id>/AGENT#<id>, we need to find the agent
  
  // For efficiency, we'll use a GSI or scan. For now, let's check if there's a way
  // to find agents by email. Since there's no GSI on agent email, we'll need to
  // check the request for agencyId or do a limited scan.
  
  // Better approach: require agencyId in login request OR add GSI2 for agent email lookup
  // For now, let's require agencyId in the request body
  const { agencyId } = JSON.parse(event.body || '{}');
  
  if (!agencyId) {
    return response(400, { ok: false, error: 'agencyId is required for agent login' }, origin);
  }

  // Query agents for this agency
  const agents = await queryByPK(`AGENCY#${agencyId}`, 'AGENT#');
  const agent = (agents as AgentRecord[]).find(
    (a) => normalizeEmail(a.email) === normalizedEmail && a.authEnabled && !a.deletedAt
  );

  if (!agent) {
    console.warn('[auth-agent-login] no agent found or auth not enabled', { email: normalizedEmail, agencyId });
    return response(401, { ok: false, error: 'Invalid credentials' }, origin);
  }

  // Verify phone
  const phoneMatch = normalizePhone(agent.phone || '') === phoneString;
  if (!phoneMatch) {
    console.warn('[auth-agent-login] phone mismatch', { email: normalizedEmail });
    return response(401, { ok: false, error: 'Invalid credentials' }, origin);
  }

  // Verify access code
  let codeOk = false;
  if (agent.accessCodeHash) {
    codeOk = await verifyAccessCode(accessString, agent.accessCodeHash);
  }
  
  console.log('[auth-agent-login] validation', {
    email: normalizedEmail,
    phoneMatch,
    codeOk,
    hasHash: Boolean(agent.accessCodeHash),
    authEnabled: agent.authEnabled,
  });

  if (!codeOk) {
    return response(401, { ok: false, error: 'Invalid credentials' }, origin);
  }

  // Fetch agency for branding
  let agencyLogo: string | undefined;
  let agencySettings: any;
  let agencyEmail: string | undefined;

  try {
    const agency = await getItem({ PK: `AGENCY#${agencyId}`, SK: 'PROFILE' }) as AgencyRecord | undefined;
    if (agency) {
      agencyLogo = agency.settings?.logoDataUrl;
      agencySettings = agency.settings;
      agencyEmail = agency.email;
    }
  } catch (e) {
    console.warn('[auth-agent-login] Failed to fetch agency settings', e);
  }

  // Update lastLoginAt
  try {
    await putItem({
      ...agent,
      lastLoginAt: Date.now(),
      updatedAt: Date.now(),
    });
  } catch (e) {
    console.warn('[auth-agent-login] Failed to update lastLoginAt', e);
  }

  // Create session with agent role
  const token = encodeSession({
    agencyId: agent.agencyId,
    agencyEmail,
    role: 'agent',
    agentId: agent.id,
    agentEmail: agent.email,
    firstName: agent.firstName,
    lastName: agent.lastName,
    agencyLogo,
    agencySettings,
  });

  const cookie = buildSessionCookie(token, secureCookie, isLocal);
  
  console.log('[auth-agent-login] success', { 
    agentId: agent.id, 
    agencyId: agent.agencyId,
    email: agent.email 
  });

  return response(200, { 
    ok: true,
    agent: {
      id: agent.id,
      firstName: agent.firstName,
      lastName: agent.lastName,
      email: agent.email,
      role: agent.role,
    }
  }, origin, {}, [cookie]);
};

export const handler = withSentry(authAgentLoginHandler);
