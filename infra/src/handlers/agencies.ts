import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, badRequest, ok } from './common';

const SEED_AGENCIES = [
  { id: 'agency-001', name: 'Prime Sports', email: 'agency1@an.test', settings: { primaryColor: '#1976d2' } },
  { id: 'agency-002', name: 'NextGen', email: 'agency2@an.test', settings: { primaryColor: '#9c27b0' } },
  { id: 'agency-003', name: 'Elite Edge', email: 'agency3@an.test', settings: { primaryColor: '#2e7d32' } },
];

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  const method = event.requestContext.http?.method?.toUpperCase();
  if (!method) return badRequest('Missing method');

  if (method === 'GET') {
    // Optional filter by email
    const email = event.queryStringParameters?.email;
    if (email) {
      const found = SEED_AGENCIES.find((a) => a.email === email);
      return ok({ ok: true, agencies: found ? [found] : [] });
    }
    return ok({ ok: true, agencies: SEED_AGENCIES });
  }

  if (method === 'PUT' && event.rawPath?.endsWith('/agencies/settings')) {
    // Stub settings update (no persistence yet)
    return ok({ ok: true, settings: (JSON.parse(event.body || '{}')?.settings) ?? {} });
  }

  if (method === 'POST') {
    // Stub upsert
    const body = event.body ? JSON.parse(event.body) : {};
    const id = body.id || `agency-${Math.random().toString(36).slice(2, 8)}`;
    return ok({ ok: true, id });
  }

  if (method === 'DELETE') {
    return ok({ ok: true });
  }

  return badRequest(`Unsupported method ${method}`);
};

