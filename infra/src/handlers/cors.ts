export const ALLOWED_ORIGINS = [
  'https://master.d2yp6hyv6u0efd.amplifyapp.com',
  'https://myrecruiteragency.com',
  'https://www.myrecruiteragency.com',
  'http://localhost:3000',
  'http://localhost:3001',
];

export function buildCors(origin?: string) {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': allow,
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  };
}

export function response(statusCode: number, body: unknown, origin?: string, extraHeaders?: Record<string, string>) {
  const cors = buildCors(origin);
  return {
    statusCode,
    headers: { ...cors, ...(extraHeaders || {}) },
    body: JSON.stringify(body),
  };
}

