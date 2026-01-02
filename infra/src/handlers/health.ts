import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { response } from './cors';
import { withSentry } from '../lib/sentry';

const healthHandler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method && method !== 'GET') return response(405, { ok: false, error: 'Method not allowed' }, origin);
  return response(200, { ok: true, service: 'athlete-narrative-api', status: 'healthy' }, origin);
};

export const handler = withSentry(healthHandler);

