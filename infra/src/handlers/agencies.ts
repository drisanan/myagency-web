import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors';
import { getItem, putItem, queryGSI1, queryGSI2 } from '../lib/dynamo';
import { newId } from '../lib/ids';
import { requireSession } from './common';
import { withSentry } from '../lib/sentry';
import { AgencyRecord } from '../lib/models';

function toRecord(input: Partial<AgencyRecord> & { email: string; name: string }, existing?: AgencyRecord): AgencyRecord {
  const id = input.id || existing?.id || newId('agency');
  return {
    // Preserve existing fields first
    ...existing,
    // Then overlay new fields
    PK: `AGENCY#${id}`,
    SK: 'PROFILE',
    GSI1PK: `EMAIL#${input.email}`,
    GSI1SK: `AGENCY#${id}`,
    id,
    name: input.name,
    email: input.email,
    settings: input.settings ?? existing?.settings,
    subscriptionLevel: input.subscriptionLevel ?? existing?.subscriptionLevel,
    createdAt: existing?.createdAt ?? Date.now(),
  };
}

const agenciesHandler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  
  // 1. Handle OPTIONS (CORS) immediately
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);

  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  console.log('agencies handler start', { method, path: event.rawPath });

  try {
    // 2. Identify the User (Session)
    // Most operations here should be scoped to the logged-in agency.
    const session = requireSession(event);

    // --- GET /agencies ---
    if (method === 'GET') {
      if (!session) {
        // If not logged in, we might return empty or 401. 
        // For now, consistent with your old logic:
        return response(401, { ok: false, error: 'Missing session' }, origin);
      }

      // Secure: Return ONLY the logged-in agency's profile
      let found = await queryGSI1(`EMAIL#${session.agencyEmail}`, 'AGENCY#');
      
      // Fallback: Query by PK using agencyId from session
      if ((!found || found.length === 0) && session.agencyId) {
        console.log('GSI1 lookup failed, trying PK lookup', { agencyId: session.agencyId });
        const agency = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: 'PROFILE' });
        if (agency) {
          found = [agency];
        }
      }
      
      return response(200, { ok: true, agencies: found || [] }, origin);
    }

    // --- PUT /agencies/slug ---
    if (method === 'PUT' && event.rawPath?.endsWith('/agencies/slug')) {
      if (!session) return response(401, { ok: false, error: 'Unauthorized' }, origin);
      if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
      
      const { slug } = JSON.parse(event.body || '{}');
      
      if (!slug || typeof slug !== 'string') {
        return response(400, { ok: false, error: 'Slug is required' }, origin);
      }
      
      // Normalize slug: lowercase, alphanumeric + hyphens only
      const normalizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
      
      if (normalizedSlug.length < 3 || normalizedSlug.length > 50) {
        return response(400, { ok: false, error: 'Agency name must be 3-50 characters (letters, numbers, hyphens only)' }, origin);
      }
      
      // Fetch agency record - try GSI1 (email) first, then PK fallback
      let agency: AgencyRecord | undefined;
      
      // Try GSI1 lookup by email first
      if (session.agencyEmail) {
        const byEmail = await queryGSI1(`EMAIL#${session.agencyEmail}`, 'AGENCY#');
        agency = byEmail?.[0] as AgencyRecord | undefined;
      }
      
      // Fallback to PK lookup
      if (!agency && session.agencyId) {
        agency = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: 'PROFILE' }) as AgencyRecord | undefined;
      }
      
      if (!agency) return response(404, { ok: false, error: 'Agency not found' }, origin);
      
      // Check uniqueness via GSI2
      const existing = await queryGSI2(`SLUG#${normalizedSlug}`);
      if (existing.length > 0 && (existing[0] as AgencyRecord).id !== agency.id) {
        return response(409, { ok: false, error: 'This agency name is already taken' }, origin);
      }
      
      const updated = {
        ...agency,
        slug: normalizedSlug,
        GSI2PK: `SLUG#${normalizedSlug}`,
        GSI2SK: `AGENCY#${agency.id}`,
      };
      
      await putItem(updated);
      
      console.log('agencies slug updated', { agencyId: agency.id, slug: normalizedSlug });
      return response(200, { ok: true, slug: normalizedSlug }, origin);
    }

    // --- PUT /agencies/settings ---
    if (method === 'PUT' && event.rawPath?.endsWith('/agencies/settings')) {
      if (!session) return response(401, { ok: false, error: 'Unauthorized' }, origin);
      if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
      
      const parsed = JSON.parse(event.body || '{}');
      
      // Secure: Force use of session email, ignore body email
      const email = session.agencyEmail; 
      
      // Try GSI1 lookup first
      const existing = await queryGSI1(`EMAIL#${email}`, 'AGENCY#');
      let agency: Record<string, any> | undefined = existing?.[0];
      
      // Fallback: Query by PK using agencyId from session
      if (!agency && session.agencyId) {
        console.log('GSI1 lookup failed, trying PK lookup', { agencyId: session.agencyId });
        agency = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: 'PROFILE' });
        
        // If found by PK but missing GSI1 attrs, add them
        if (agency && !agency.GSI1PK) {
          agency.GSI1PK = `EMAIL#${email}`;
          agency.GSI1SK = `AGENCY#${session.agencyId}`;
        }
      }
      
      if (!agency) return response(404, { ok: false, error: 'Agency not found' }, origin);
      
      // Merge settings
      const updated = { ...agency, settings: parsed.settings || {} };
      await putItem(updated);
      
      console.log('agencies update settings', { email, settings: updated.settings });
      return response(200, { ok: true, settings: updated.settings }, origin);
    }

    // --- POST /agencies (Create/Update) ---
    if (method === 'POST') {
      // NOTE: Creating a NEW agency usually happens via ghl-login now.
      // But if we allow manual creation/updates here:
      
      const body = event.body ? JSON.parse(event.body) : {};
      
      // Security Check: If updating, ensure we own the record
      if (body.id && session && body.id !== session.agencyId) {
         return response(403, { ok: false, error: 'Cannot update another agency' }, origin);
      }

      if (!body.email || !body.name) {
        return response(400, { ok: false, error: 'name and email are required' }, origin);
      }
      
      // Fetch existing record to preserve fields like subscriptionLevel
      let existing: AgencyRecord | undefined;
      if (body.id) {
        existing = await getItem({ PK: `AGENCY#${body.id}`, SK: 'PROFILE' }) as AgencyRecord | undefined;
      }
      
      const rec = toRecord(body, existing);
      try {
        await putItem(rec);
        return response(200, { ok: true, id: rec.id }, origin);
      } catch (err: any) {
        console.error('agencies upsert error', { error: err?.message });
        return response(500, { ok: false, error: 'Failed to upsert agency' }, origin);
      }
    }

    // --- DELETE /agencies ---
    if (method === 'DELETE') {
      if (!session) return response(401, { ok: false, error: 'Unauthorized' }, origin);
      
      // Secure: Only allow deleting YOURSELF
      const idToDelete = event.pathParameters?.id || event.queryStringParameters?.id;
      
      if (idToDelete !== session.agencyId) {
        return response(403, { ok: false, error: 'Cannot delete another agency' }, origin);
      }

      const existing = await getItem({ PK: `AGENCY#${session.agencyId}`, SK: 'PROFILE' });
      if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);
      
      await putItem({ ...existing, deletedAt: new Date().toISOString() });
      console.log('agencies soft-deleted', { id: session.agencyId });
      return response(200, { ok: true }, origin);
    }

    return response(405, { ok: false, error: `Method not allowed` }, origin);
  } catch (e: any) {
    console.error('agencies handler error', { error: e?.message });
    return response(500, { ok: false, error: 'Server error' }, origin);
  }
};

export const handler = withSentry(agenciesHandler);