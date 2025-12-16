import { APIGatewayProxyEventV2 } from 'aws-lambda';
import { Handler, badRequest, ok } from './common';
import { buildClearCookie, buildSessionCookie, encodeSession, parseSessionFromRequest } from '../lib/session';

export const handler: Handler = async (event: APIGatewayProxyEventV2) => {
  if (!event.requestContext.http?.method) {
    return badRequest('Missing method');
  }
  const method = event.requestContext.http.method.toUpperCase();
  const originHdr = event.headers['origin'] || event.headers['Origin'] || '';
  const host = event.headers['x-forwarded-host'] || event.headers['Host'] || '';
  const proto = event.headers['x-forwarded-proto'] || 'https';
  const resolvedOrigin = originHdr || `${proto}://${host}`;
  const secureCookie = proto === 'https' && !resolvedOrigin.includes('localhost');

  const corsHeaders = {
    'access-control-allow-origin': resolvedOrigin,
    'access-control-allow-credentials': 'true',
    'access-control-allow-headers': 'Content-Type,Authorization',
    'access-control-allow-methods': 'GET,POST,DELETE,OPTIONS',
  };

  if (method === 'OPTIONS') {
    return { statusCode: 200, headers: corsHeaders, body: JSON.stringify({ ok: true }) };
  }

  switch (method) {
    case 'GET':
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'content-type': 'application/json' },
        body: JSON.stringify({ ok: true, session: parseSessionFromRequest(event) }),
      };
    case 'POST':
      if (!event.body) return badRequest('Missing body');
      const payload = JSON.parse(event.body);
      if (!payload.agencyId || !payload.email || !payload.role) {
        return badRequest('agencyId, email, role required');
      }
      const token = encodeSession({
        agencyId: payload.agencyId,
        agencyEmail: payload.email,
        role: payload.role,
        userId: payload.userId,
      });
      const cookie = buildSessionCookie(token, secureCookie);
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'content-type': 'application/json', 'set-cookie': cookie },
        body: JSON.stringify({ ok: true, session: payload }),
      };
    case 'DELETE':
      return {
        statusCode: 200,
        headers: { ...corsHeaders, 'set-cookie': buildClearCookie(secureCookie) },
        body: JSON.stringify({ ok: true }),
      };
    default:
      return badRequest(`Unsupported method ${method}`);
  }
};

