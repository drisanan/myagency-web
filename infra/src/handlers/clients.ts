import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { newId } from '../lib/ids';
import { ClientRecord, AgencyRecord, STARTER_USER_LIMIT, EmailDripRecord, DripEnrollmentRecord } from '../lib/models';
import { hashAccessCode } from '../lib/auth';
import { getItem, putItem, queryByPK, queryByPKPaginated, queryGSI3 } from '../lib/dynamo';
import { response } from './cors';
import { withSentry, captureMessage } from '../lib/sentry';
import { logAuditEvent, extractAuditContext } from '../lib/audit';

function badRequest(origin: string, msg: string) {
  return response(400, { ok: false, error: msg }, origin);
}

function getClientId(event: APIGatewayProxyEventV2) {
  return event.pathParameters?.id;
}

function enrollmentKey(dripId: string, clientId: string) {
  return `DRIP_ENROLL#${dripId}#${clientId}`;
}

const clientsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  // 1. Handle OPTIONS for CORS Preflight
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  // 2. Validate Session
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  // CRITICAL FIX: Trim any invisible whitespace from the ID
  const cleanAgencyId = session.agencyId.trim();
  const clientId = getClientId(event);

  // --- GET ---
  if (method === 'GET') {
    // A. Get Single Client
    if (clientId) {
      const item = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: `CLIENT#${clientId}` });
      return response(200, { ok: true, client: item ?? null }, origin);
    }
    
    const qs = event.queryStringParameters || {};
    const pk = `AGENCY#${cleanAgencyId}`;

    // Paginated path: if `limit` or `cursor` is provided
    if (qs.limit || qs.cursor) {
      const { items, nextCursor } = await queryByPKPaginated(pk, 'CLIENT#', {
        limit: qs.limit ? parseInt(qs.limit, 10) : 50,
        cursor: qs.cursor || undefined,
      });
      const activeClients = items.filter((c: any) => !c.deletedAt);
      return response(200, { ok: true, clients: activeClients, nextCursor }, origin);
    }
    
    // Legacy path: return all clients (backward-compatible)
    let items = await queryByPK(pk, 'CLIENT#');

    // Fallback (If DynamoDB SK filtering is behaving unexpectedly)
    if (items.length === 0) {
      console.log('[Clients] WARN: Standard query returned 0. Attempting PK-only fallback.', { pk });
      
      const allAgencyItems = await queryByPK(pk);
      const recoveredClients = allAgencyItems.filter((i: any) => i.SK && i.SK.startsWith('CLIENT#'));
      
      if (recoveredClients.length > 0) {
        console.log('[Clients] RECOVERED: Found clients via manual memory filter.', { count: recoveredClients.length });
        items = recoveredClients;
      } else {
        if (allAgencyItems.length > 1) {
          captureMessage('Agency has items but no clients found', 'warning', {
            agencyId: cleanAgencyId,
           totalItemsFound: allAgencyItems.length,
            typesFound: allAgencyItems.map((i: any) => i.SK?.split('#')[0]),
        });
        }
      }
    }

    // Filter out soft-deleted clients
    const activeClients = items.filter((c: any) => !c.deletedAt);
    return response(200, { ok: true, clients: activeClients }, origin);
  }

  // --- POST ---
  if (method === 'POST') {
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    if (!payload.email || !payload.firstName || !payload.lastName || !payload.sport) {
      return badRequest(origin, 'email, firstName, lastName, sport are required');
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
    
    const id = payload.id || newId('client');
    const now = new Date().toISOString();
    
    // Use the cleaned ID
    let accessCodeHash: string | undefined;
    if (payload.accessCode) {
      accessCodeHash = await hashAccessCode(payload.accessCode);
    }

    // Validate username uniqueness if provided
    let username = payload.username?.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (username) {
      try {
        const existing = await queryGSI3(`USERNAME#${username}`);
        if (existing.length > 0) {
          return badRequest(origin, 'Username is already taken');
        }
      } catch (e) {
        console.error('[clients] Username uniqueness check failed:', e);
      }
    }

    const rec: ClientRecord = {
      PK: `AGENCY#${cleanAgencyId}`,
      SK: `CLIENT#${id}`,
      GSI1PK: `EMAIL#${payload.email}`,
      GSI1SK: `CLIENT#${id}`,
      ...(username ? { GSI3PK: `USERNAME#${username}`, GSI3SK: `CLIENT#${id}` } : {}),
      id,
      email: payload.email,
      firstName: payload.firstName,
      lastName: payload.lastName,
      sport: payload.sport,
      agencyId: cleanAgencyId,
      agencyEmail: session.agencyEmail,
      phone: payload.phone,
      username,
      galleryImages: payload.galleryImages || [],
      radar: payload.radar || {},
      accessCodeHash,
      authEnabled: Boolean(accessCodeHash),
      createdAt: now,
      updatedAt: now,
    };
    
    await putItem(rec);
    
    // Audit log: client created
    await logAuditEvent({
      session,
      action: 'client_create',
      targetType: 'client',
      targetId: id,
      targetName: `${payload.firstName} ${payload.lastName}`,
      ...extractAuditContext(event),
    });

    // Auto-enroll in signup drips (best-effort)
    try {
      const drips = await queryByPK(`AGENCY#${cleanAgencyId}`, 'EMAIL_DRIP#') as EmailDripRecord[];
      const signupDrips = (drips || []).filter((d) => d.isActive && d.triggerEvent === 'signup');
      for (const drip of signupDrips) {
        if (!drip.steps?.length) continue;
        const existing = await getItem({
          PK: `AGENCY#${cleanAgencyId}`,
          SK: enrollmentKey(drip.id, id),
        });
        if (existing) continue;
        const nowMs = Date.now();
        const firstStep = drip.steps[0];
        const nextSendAt = nowMs + Math.max(0, Number(firstStep.dayOffset || 0)) * 24 * 60 * 60 * 1000;
        const enrollRec: DripEnrollmentRecord = {
          PK: `AGENCY#${cleanAgencyId}`,
          SK: enrollmentKey(drip.id, id),
          dripId: drip.id,
          clientId: id,
          agencyId: cleanAgencyId,
          currentStepIndex: 0,
          startedAt: nowMs,
          nextSendAt,
        };
        await putItem(enrollRec);
      }
    } catch (e) {
      console.error('[clients] auto-enroll signup drips failed', e);
    }
    
    return response(200, { ok: true, client: rec }, origin);
  }

  // --- PUT / PATCH ---
  if (method === 'PUT' || method === 'PATCH') {
    if (!clientId) return badRequest(origin, 'Missing client id');
    if (!event.body) return badRequest(origin, 'Missing body');
    const payload = JSON.parse(event.body);
    
    const existing = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: `CLIENT#${clientId}` }) as ClientRecord | undefined;
    if (!existing) return response(404, { ok: false, message: 'Not found' }, origin);
    
    const now = new Date().toISOString();
    
    // Handle username update with uniqueness check
    let username = payload.username?.toLowerCase().replace(/[^a-z0-9-]/g, '');
    if (username && username !== existing.username) {
      try {
        const usernameCheck = await queryGSI3(`USERNAME#${username}`);
        if (usernameCheck.length > 0) {
          return badRequest(origin, 'Username is already taken');
        }
      } catch (e) {
        console.error('[clients] Username uniqueness check failed:', e);
      }
    }
    
    const merged: ClientRecord = { 
      ...existing, 
      ...payload, 
      updatedAt: now,
      ...(username ? { 
        username,
        GSI3PK: `USERNAME#${username}`, 
        GSI3SK: `CLIENT#${clientId}` 
      } : {}),
    };
    
    if (payload.accessCode) {
      merged.accessCodeHash = await hashAccessCode(payload.accessCode);
      merged.authEnabled = true;
    }
    await putItem(merged);
    
    // Audit log: client updated
    await logAuditEvent({
      session,
      action: 'client_update',
      targetType: 'client',
      targetId: clientId,
      targetName: `${merged.firstName} ${merged.lastName}`,
      details: { fieldsUpdated: Object.keys(payload) },
      ...extractAuditContext(event),
    });
    
    return response(200, { ok: true, client: merged }, origin);
  }

  // --- DELETE ---
  if (method === 'DELETE') {
    if (!clientId) return response(400, { ok: false, error: 'Missing client id' }, origin);
    
    const existing = await getItem({ PK: `AGENCY#${cleanAgencyId}`, SK: `CLIENT#${clientId}` }) as ClientRecord | undefined;
    if (existing) {
      await putItem({
        ...existing,
        deletedAt: new Date().toISOString(),
      });
      
      // Audit log: client deleted
      await logAuditEvent({
        session,
        action: 'client_delete',
        targetType: 'client',
        targetId: clientId,
        targetName: `${existing.firstName} ${existing.lastName}`,
        ...extractAuditContext(event),
      });
    }
    return response(200, { ok: true }, origin);
  }

  return response(405, { ok: false, error: `Method not allowed` }, origin);
};

// Wrap with Sentry for error tracking
export const handler = withSentry(clientsHandler);