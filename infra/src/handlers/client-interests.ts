import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, requireSession } from './common';
import { response } from './cors';
import { queryClientLists } from '../lib/dynamo';
import { withSentry } from '../lib/sentry';

const clientInterestsHandler: Handler = async (event: APIGatewayProxyEventV2) => {
  const origin = event.headers?.origin || event.headers?.Origin || event.headers?.['origin'] || '';
  const method = (event.requestContext.http?.method || '').toUpperCase();
  if (method === 'OPTIONS') return response(200, { ok: true }, origin);
  if (method !== 'GET') return response(405, { ok: false, error: 'Method not allowed' }, origin);

  const session = requireSession(event);
  if (!session) return response(401, { ok: false, error: 'Missing session' }, origin);

  const clientId = event.pathParameters?.id;
  if (!clientId) return response(400, { ok: false, error: 'Missing client id' }, origin);

  // Authz: client can fetch own interests; agency users can fetch for their agency clients
  if (session.role === 'client' && session.clientId !== clientId) {
    return response(403, { ok: false, error: 'Forbidden' }, origin);
  }

  const items = await queryClientLists(clientId);
  const filtered = (items || []).filter((i: any) => i.type === 'CLIENT_INTEREST');
  return response(200, { ok: true, lists: filtered }, origin);
};

export const handler = withSentry(clientInterestsHandler);

