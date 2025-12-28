import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors'; 
import { requireSession } from './common';
import { getItem, putItem, queryByPK } from '../lib/dynamo';
import { sign } from '../lib/formsToken';

export const handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  const path = event.rawPath || event.requestContext.http?.path || '';

  // 1. Handle CORS Preflight
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  // 2. Validate Session (Agency Only)
  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  // =========================================================================
  // ROUTE: Issue a new Form Token
  // POST /forms/issue
  // =========================================================================
  if (method === 'POST' && path.endsWith('/forms/issue')) {
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

  // =========================================================================
  // ROUTE: List Submissions
  // GET /forms/submissions
  // =========================================================================
  if (method === 'GET' && path.endsWith('/forms/submissions')) {
    const items = await queryByPK(`AGENCY#${session.agencyId}`, 'FORM#');
    const pending = (items || []).filter((s: any) => !s.consumed);
    return response(200, { ok: true, items: pending }, origin);
  }

  // =========================================================================
  // ROUTE: Consume (Mark Read) Submissions
  // POST /forms/consume
  // =========================================================================
  if (method === 'POST' && path.endsWith('/forms/consume')) {
    if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
    const { ids } = JSON.parse(event.body);
    
    if (!Array.isArray(ids)) return response(400, { ok: false, error: 'ids must be array' }, origin);

    for (const id of ids) {
      const item = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: `FORM#${id}` });
      if (item) {
        await putItem({ ...item, consumed: true });
      }
    }
    return response(200, { ok: true }, origin);
  }

  return response(404, { ok: false, error: 'Private forms path not found' }, origin);
};