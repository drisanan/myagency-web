import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SessionContext } from '../lib/models';
import { parseSessionFromRequest } from '../lib/session';

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

const DEBUG_SESSION = process.env.DEBUG_SESSION === 'true';

export type Handler = (event: APIGatewayProxyEventV2) => Promise<APIGatewayProxyResultV2>;

export function jsonResponse(statusCode: number, body: unknown): APIGatewayProxyResultV2 {
  return {
    statusCode,
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  };
}

export function notImplemented(resource: string, method: string) {
  return jsonResponse(501, { ok: false, message: `${method} ${resource} not implemented` });
}

export function badRequest(message: string) {
  return jsonResponse(400, { ok: false, message });
}

export function ok(body: unknown) {
  return jsonResponse(200, body);
}

export function getSession(event: APIGatewayProxyEventV2): SessionContext | null {
  const origin = event.headers?.origin || event.headers?.Origin || (event.headers as any)?.['origin'] || '';
  const parsed = parseSessionFromRequest(event);
  if (DEBUG_SESSION) {
    console.log('session_debug', {
      origin,
      hasCookiesArray: Array.isArray(event.cookies) && event.cookies.length > 0,
      hasCookieHeader: Boolean((event.headers as any)?.cookie || (event.headers as any)?.Cookie),
      session: parsed,
      method: event.requestContext?.http?.method,
      path: event.rawPath,
    });
  }
  if (parsed) return parsed;
  // Fallback for temporary header-based dev mode
  const agencyId = (event.headers['x-agency-id'] as string) || (event.headers['X-Agency-Id'] as string);
  const agencyEmail = (event.headers['x-agency-email'] as string) || (event.headers['X-Agency-Email'] as string);
  const role = (event.headers['x-role'] as SessionContext['role']) || 'agency';
  if (!agencyId) return null;
  const fallback = { agencyId, agencyEmail, role };
  if (DEBUG_SESSION) {
    console.log('session_debug_fallback', { origin, fallback });
  }
  return fallback;
}

export function requireSession(event: APIGatewayProxyEventV2): SessionContext | null {
  return getSession(event);
}

