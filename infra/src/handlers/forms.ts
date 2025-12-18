import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors'; // Using the standard helper that handles headers correctly
import { requireSession } from './common';
import { newId } from '../lib/ids';
import { getItem, putItem, queryByPK, queryGSI1 } from '../lib/dynamo';
import { sign, verify } from '../lib/formsToken'; // Ensure you have this lib or similar logic

export const handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const path = event.rawPath || event.requestContext.http?.path || '';

  // 1. Handle CORS Preflight (Always Public)
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  // =========================================================================
  // PUBLIC ROUTES (No Session Required - Protected by Token)
  // =========================================================================

  // A. Athlete viewing the form: Resolve Token -> Agency Info
  if (method === 'GET' && path.endsWith('/forms/agency')) {
    const token = event.queryStringParameters?.token;
    if (!token) return response(400, { ok: false, error: 'Missing token' }, origin);
    
    const payload = verify<{ agencyEmail: string }>(token);
    if (!payload?.agencyEmail) return response(400, { ok: false, error: 'Invalid or expired token' }, origin);

    // Look up agency by email to get public details
    const agencies = await queryGSI1(`EMAIL#${payload.agencyEmail}`, 'AGENCY#');
    const agency = agencies?.[0];
    
    if (!agency) return response(404, { ok: false, error: 'Agency not found' }, origin);

    // Return only safe, public info
    return response(200, { 
      ok: true, 
      agency: { 
        name: agency.name, 
        email: agency.email, 
        settings: agency.settings || {} 
      } 
    }, origin);
  }

  // B. Athlete submitting data: Verify Token -> Write to Agency DB
  if (method === 'POST' && path.endsWith('/forms/submit')) {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const body = JSON.parse(event.body);
    const { token, form } = body;

    if (!token || !form) return response(400, { ok: false, error: 'Missing token or form data' }, origin);

    const payload = verify<{ agencyEmail: string }>(token);
    if (!payload?.agencyEmail) return response(400, { ok: false, error: 'Invalid or expired token' }, origin);

    // 1. Find Agency ID from Email (to write to correct partition)
    const agencies = await queryGSI1(`EMAIL#${payload.agencyEmail}`, 'AGENCY#');
    const agency = agencies?.[0];
    if (!agency) return response(404, { ok: false, error: 'Agency not found' }, origin);

    // 2. Create Submission Record
    const id = newId('form');
    const now = Date.now();
    
    const submission = {
        PK: `AGENCY#${agency.id}`, // Write to Agency's partition
        SK: `FORM#${id}`,
        id,
        createdAt: now,
        consumed: false, // New/Unread
        data: form,
        // Optional: Expiration if needed
        // ttl: Math.floor(now / 1000) + (60 * 60 * 24 * 30) 
    };
    
    await putItem(submission);
    return response(200, { ok: true, id }, origin);
  }

  // =========================================================================
  // PRIVATE ROUTES (Session Required - Agency Dashboard)
  // =========================================================================

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  // C. Agency creating a new public link
  if (method === 'POST' && path.endsWith('/forms/issue')) {
    // Generate a token valid for e.g., 30 days
    const payload = {
      agencyEmail: session.agencyEmail,
      iat: Date.now(),
      exp: Date.now() + (1000 * 60 * 60 * 24 * 30)
    };
    const token = sign(payload);
    
    // Helper to construct the full frontend URL
    // (Adjust protocol/host if you have specific requirements)
    const host = event.headers['host'] || 'myrecruiteragency.com';
    const url = `https://${host}/forms/start?token=${token}`; 
    
    return response(200, { ok: true, token, url }, origin);
  }

  // D. Agency listing inbox (submissions)
  if (method === 'GET' && path.endsWith('/forms/submissions')) {
    // Query everything in the agency's FORM partition
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'FORM#');
    
    // Filter to show only unread (unconsumed) items
    const pending = (items || []).filter((s: any) => !s.consumed);
    
    return response(200, { ok: true, items: pending }, origin);
  }

  // E. Agency marking items as read (consumed)
  if (method === 'POST' && path.endsWith('/forms/consume')) {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const { ids } = JSON.parse(event.body);
    
    if (!Array.isArray(ids)) return response(400, { ok: false, error: 'ids must be array' }, origin);

    // Process each ID
    for (const id of ids) {
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `FORM#${id}` });
      if (item) {
        // Mark as consumed so it disappears from the main list
        await putItem({ ...item, consumed: true });
      }
    }
    return response(200, { ok: true }, origin);
  }

  return response(404, { ok: false, error: 'Path not found' }, origin);
};