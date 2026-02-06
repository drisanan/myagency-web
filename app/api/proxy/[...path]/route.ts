import { NextRequest, NextResponse } from 'next/server';

/**
 * Local-dev API proxy – keeps session cookies first-party.
 *
 * The production API (api.myrecruiteragency.com) sets cookies with
 * Domain=.myrecruiteragency.com which browsers reject when the page
 * is served from localhost.  This proxy strips the Domain/Secure flags
 * so the cookie is scoped to localhost instead.
 *
 * Only active when NEXT_PUBLIC_API_BASE_URL starts with "/api/proxy".
 */

const REAL_API = process.env.PROXY_TARGET_API || 'https://api.myrecruiteragency.com';

async function handler(req: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const target = `${REAL_API}/${path.join('/')}`;

  // Forward query string
  const url = new URL(target);
  req.nextUrl.searchParams.forEach((v, k) => url.searchParams.set(k, v));

  // Build forwarded headers (skip host/connection)
  const fwdHeaders = new Headers();
  req.headers.forEach((v, k) => {
    const lk = k.toLowerCase();
    if (lk === 'host' || lk === 'connection' || lk === 'transfer-encoding') return;
    fwdHeaders.set(k, v);
  });
  // Ensure Origin is the real API origin so CORS passes
  fwdHeaders.set('Origin', new URL(REAL_API).origin);

  // Forward cookies (browser sends them to localhost; relay to real API)
  const cookieHeader = req.headers.get('cookie');
  if (cookieHeader) {
    fwdHeaders.set('Cookie', cookieHeader);
  }

  const apiRes = await fetch(url.toString(), {
    method: req.method,
    headers: fwdHeaders,
    body: ['GET', 'HEAD'].includes(req.method) ? undefined : await req.arrayBuffer(),
    redirect: 'manual',
  });

  // Build the response
  const resHeaders = new Headers();
  apiRes.headers.forEach((v, k) => {
    const lk = k.toLowerCase();
    // Skip hop-by-hop and CORS headers (Next.js will handle CORS)
    if (['transfer-encoding', 'connection', 'access-control-allow-origin',
         'access-control-allow-credentials', 'access-control-allow-headers',
         'access-control-allow-methods'].includes(lk)) return;

    // Rewrite Set-Cookie so it works on localhost
    if (lk === 'set-cookie') {
      const rewritten = v
        .replace(/;\s*Domain=[^;]*/gi, '')       // strip Domain
        .replace(/;\s*Secure/gi, '')              // strip Secure (localhost is http)
        .replace(/;\s*SameSite=[^;]*/gi, '; SameSite=Lax'); // Lax for same-site
      resHeaders.append('Set-Cookie', rewritten);
      return;
    }

    resHeaders.set(k, v);
  });

  // Allow credentials from localhost
  resHeaders.set('Access-Control-Allow-Origin', req.headers.get('origin') || '*');
  resHeaders.set('Access-Control-Allow-Credentials', 'true');

  return new NextResponse(apiRes.body, {
    status: apiRes.status,
    statusText: apiRes.statusText,
    headers: resHeaders,
  });
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;

// Handle CORS preflight
export async function OPTIONS(req: NextRequest) {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': req.headers.get('origin') || '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Cookie',
      'Access-Control-Allow-Credentials': 'true',
      'Access-Control-Max-Age': '86400',
    },
  });
}
