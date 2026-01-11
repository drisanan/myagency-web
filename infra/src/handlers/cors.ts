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
    // Include X-Local-Set-Cookie in exposed headers so frontend can read it
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Expose-Headers': 'X-Local-Set-Cookie',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
  };
}

export function response(
  statusCode: number,
  body: unknown,
  origin?: string,
  extraHeaders?: Record<string, string>,
  cookies?: string[]
) {
  const cors = buildCors(origin);
  const isLocal = origin?.includes('localhost');
  // Strip any set-cookie from extraHeaders (we handle cookies separately)
  const { 'set-cookie': _, 'Set-Cookie': __, ...cleanHeaders } = extraHeaders || {};
  
  const res: Record<string, unknown> = {
    statusCode,
    headers: { ...cors, ...cleanHeaders } as Record<string, string>,
    body: JSON.stringify(body),
  };

  if (cookies && cookies.length > 0) {
    if (isLocal) {
      // LOCAL DEV: Use custom header to bypass Hapi's strict cookie validation
      // Frontend will read this and manually set document.cookie
      (res.headers as Record<string, string>)['X-Local-Set-Cookie'] = cookies[0];
    } else {
      // PRODUCTION: Standard AWS HTTP API v2 cookies array
      res.cookies = cookies;
    }
  }

  return res;
}

