import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors';
import { newId } from '../lib/ids';
import { putItem, getItem, queryGSI1, queryByPK } from '../lib/dynamo';
import { verify, sign } from '../lib/formsToken';
import { requireSession } from './common';

export const handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const path = event.rawPath || event.requestContext.http?.path || '';

  // 1. Handle CORS Preflight (Always allowed)
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  // =========================================================================
  // PUBLIC ROUTES (No Session Required)
  // Protected by JWT Token instead of Session Cookie
  // =========================================================================

  // A. Athlete viewing the form: Resolve Token -> Agency Info
  if (method === 'GET' && path.endsWith('/forms/agency')) {
    const token = event.queryStringParameters?.token;
    if (!token) return response(400, { ok: false, error: 'Missing token' }, origin);
    
    const payload = verify<{ agencyEmail: string }>(token);
    if (!payload?.agencyEmail) {
      return response(400, { ok: false, error: 'Invalid or expired token' }, origin);
    }

    const agencies = await queryGSI1(`EMAIL#${payload.agencyEmail}`, 'AGENCY#');
    const agency = agencies?.[0];
    
    if (!agency) return response(404, { ok: false, error: 'Agency not found' }, origin);

    return response(200, { 
      ok: true, 
      agency: { 
        name: agency.name, 
        email: agency.email, 
        settings: agency.settings || {} 
      } 
    }, origin);
  }

  // B. Athlete submitting the form
  if (method === 'POST' && path.endsWith('/forms/submit')) {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const body = JSON.parse(event.body);
    const { token, form } = body;

    if (!token || !form) return response(400, { ok: false, error: 'Missing token or form data' }, origin);

    const payload = verify<{ agencyEmail: string }>(token);
    if (!payload?.agencyEmail) return response(400, { ok: false, error: 'Invalid or expired token' }, origin);

    const agencies = await queryGSI1(`EMAIL#${payload.agencyEmail}`, 'AGENCY#');
    const agency = agencies?.[0];
    if (!agency) return response(404, { ok: false, error: 'Agency not found' }, origin);

    const id = newId('form');
    const now = Date.now();
    
    const submission = {
        PK: `AGENCY#${agency.id}`, 
        SK: `FORM#${id}`,
        id,
        createdAt: now,
        consumed: false, 
        agencyEmail: agency.email,
        data: form,
    };
    
    await putItem(submission);
    return response(200, { ok: true, id }, origin);
  }

  // =========================================================================
  // PRIVATE ROUTES (Session Required)
  // Protected by 'requireSession'
  // =========================================================================

  // Helper: Enforce session locally for these routes
  const ensureSession = () => {
    const s = requireSession(event);
    if (!s) throw new Error('Unauthorized');
    return s;
  };

  try {
    // C. Issue a new Form Token
    if (method === 'POST' && path.endsWith('/forms/issue')) {
      const session = ensureSession();
      
      const payload = {
        agencyEmail: session.agencyEmail,
        iat: Date.now(),
        exp: Date.now() + (1000 * 60 * 60 * 24 * 30) // 30 days
      };
      const token = sign(payload);
      
      const frontendHost = process.env.FRONTEND_URL || 'www.myrecruiteragency.com';
      const base = frontendHost.startsWith('http') ? frontendHost : `https://${frontendHost}`;
      const url = `${base}/forms/${token}`;
      
      return response(200, { ok: true, token, url }, origin);
    }

    // D. List Submissions
    if (method === 'GET' && path.endsWith('/forms/submissions')) {
      const session = ensureSession();
      
      const items = await queryByPK(`AGENCY#${session.agencyId}`, 'FORM#');
      const pending = (items || []).filter((s: any) => !s.consumed);
      return response(200, { ok: true, items: pending }, origin);
    }

    // E. Consume (Mark Read) Submissions
    if (method === 'POST' && path.endsWith('/forms/consume')) {
      const session = ensureSession();
      
      if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
      const { ids } = JSON.parse(event.body);
      
      if (!Array.isArray(ids)) return response(400, { ok: false, error: 'ids must be array' }, origin);

      for (const id of ids) {
        const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `FORM#${id}` });
        // Security check: ensure item belongs to this agency
        if (item) {
          await putItem({ ...item, consumed: true });
        }
      }
      return response(200, { ok: true }, origin);
    }

  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return response(401, { ok: false, error: 'Missing session' }, origin);
    }
    console.error('Handler Error', error);
    return response(500, { ok: false, error: 'Internal Server Error' }, origin);
  }

  return response(404, { ok: false, error: 'Path not found' }, origin);
};