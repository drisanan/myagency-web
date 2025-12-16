import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import { SessionContext } from '../lib/models';
import { parseSessionFromRequest } from '../lib/session';

const client = new DynamoDBClient({});
export const docClient = DynamoDBDocumentClient.from(client);

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
  const parsed = parseSessionFromRequest(event);
  if (parsed) return parsed;
  // Fallback for temporary header-based dev mode
  const agencyId = event.headers['x-agency-id'] || event.headers['X-Agency-Id'];
  const agencyEmail = event.headers['x-agency-email'] || event.headers['X-Agency-Email'];
  const role = (event.headers['x-role'] as SessionContext['role']) || 'agency';
  if (!agencyId) return null;
  return { agencyId, agencyEmail, role };
}

export function requireSession(event: APIGatewayProxyEventV2): SessionContext | null {
  return getSession(event);
}

