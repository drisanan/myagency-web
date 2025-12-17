import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors';
import { getItem, putItem, queryGSI1 } from '../lib/dynamo';
import { newId } from '../lib/ids';

type AgencyRecord = {
  PK: string;
  SK: string;
  GSI1PK: string;
  GSI1SK: string;
  id: string;
  name: string;
  email: string;
  settings?: { primaryColor?: string; secondaryColor?: string; logoDataUrl?: string };
  deletedAt?: string;
};

function toRecord(input: { id?: string; name?: string; email?: string; settings?: any }): AgencyRecord {
  const id = input.id || newId('agency');
  return {
    PK: `AGENCY#${id}`,
    SK: 'PROFILE',
    GSI1PK: `EMAIL#${input.email}`,
    GSI1SK: `AGENCY#${id}`,
    id,
    name: input.name || 'New Agency',
    email: input.email || '',
    settings: input.settings,
  };
}

export const handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (!method) return response(400, { ok: false, error: 'Missing method' }, origin);

  console.log('agencies handler start', { method, path: event.rawPath, qs: event.queryStringParameters });

  try {
    if (method === 'OPTIONS') return response(200, { ok: true }, origin);

    if (method === 'GET') {
      const email = event.queryStringParameters?.email;
      if (email) {
        const found = await queryGSI1(`EMAIL#${email}`, 'AGENCY#');
        return response(200, { ok: true, agencies: found || [] }, origin);
      }
      // No email filter: avoid table scan; return empty list
      return response(200, { ok: true, agencies: [] }, origin);
    }

    if (method === 'PUT' && event.rawPath?.endsWith('/agencies/settings')) {
      if (!event.body) return response(400, { ok: false, error: 'Missing body' }, origin);
      const parsed = JSON.parse(event.body || '{}');
      const email = parsed.email;
      if (!email) return response(400, { ok: false, error: 'Missing email' }, origin);
      const existing = await queryGSI1(`EMAIL#${email}`, 'AGENCY#');
      const agency = existing?.[0];
      if (!agency) return response(404, { ok: false, error: 'Agency not found' }, origin);
      const updated = { ...agency, settings: parsed.settings || {} };
      await putItem(updated);
      console.log('agencies update settings', { email, settings: updated.settings });
      return response(200, { ok: true, settings: updated.settings }, origin);
    }

    if (method === 'POST') {
      console.log('agencies POST start', { rawBody: event.body });
      const body = event.body ? JSON.parse(event.body) : {};
      if (!body.email || !body.name) {
        console.warn('agencies POST missing fields', { body });
        return response(400, { ok: false, error: 'name and email are required' }, origin);
      }
      const rec = toRecord(body);
      try {
        await putItem(rec);
        console.log('agencies upsert success', { id: rec.id, email: rec.email, settings: rec.settings });
        return response(200, { ok: true, id: rec.id }, origin);
      } catch (err: any) {
        console.error('agencies upsert error', { error: err?.message, stack: err?.stack, id: rec.id, email: rec.email });
        return response(500, { ok: false, error: err?.message || 'Failed to upsert agency' }, origin);
      }
    }

    if (method === 'DELETE') {
      const id = event.queryStringParameters?.id;
      if (!id) return response(400, { ok: false, error: 'Missing id' }, origin);
      const existing = await getItem({ PK: `AGENCY#${id}`, SK: 'PROFILE' });
      if (!existing) return response(404, { ok: false, error: 'Not found' }, origin);
      await putItem({ ...existing, deletedAt: new Date().toISOString() });
      console.log('agencies soft-deleted', { id });
      return response(200, { ok: true }, origin);
    }

    return response(405, { ok: false, error: `Method not allowed` }, origin);
  } catch (e: any) {
    console.error('agencies handler error', { error: e?.message, stack: e?.stack });
    return response(500, { ok: false, error: e?.message || 'Server error' }, origin);
  }
};

