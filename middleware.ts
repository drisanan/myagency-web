import { NextRequest, NextResponse } from 'next/server';

/**
 * Host-based tenancy middleware (Phase 3).
 *
 * Next.js middleware runs in the Edge Runtime which cannot talk to DynamoDB,
 * so we do the minimum possible here: detect whether the request is on a
 * non-canonical host (i.e. a custom or pilot domain), tag the request with
 * the normalized hostname, and rewrite `/` to `/landing` so the Node-side
 * server component can resolve `DOMAIN#<hostname>` against DynamoDB.
 *
 * Unknown or canonical hosts fall through to the existing route tree.
 *
 * See docs/02-solutions-architect/whitelabel-audit.md sections 6-7.
 */

const CANONICAL_SUFFIXES = ['myrecruiteragency.com', 'localhost'];

// Reserved paths we never rewrite, even on custom hosts: API, Next internals,
// static assets, auth surface (handled separately in Phase 4).
const PASSTHROUGH_PREFIXES = [
  '/api/',
  '/_next/',
  '/static/',
  '/marketing/',
  '/favicon',
  '/icon',
  '/robots.txt',
  '/sitemap',
];

function normalizeHostForEdge(raw: string): string {
  return raw.trim().toLowerCase().replace(/\.$/, '').split(':')[0];
}

function isCanonicalHost(host: string): boolean {
  return CANONICAL_SUFFIXES.some((suffix) => host === suffix || host.endsWith(`.${suffix}`));
}

export function middleware(request: NextRequest) {
  const rawHost =
    request.headers.get('x-forwarded-host') || request.headers.get('host') || '';
  const host = normalizeHostForEdge(rawHost);
  const pathname = request.nextUrl.pathname;

  if (!host) return NextResponse.next();
  if (PASSTHROUGH_PREFIXES.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  if (isCanonicalHost(host)) {
    return NextResponse.next();
  }

  // Custom or pilot host. Forward the normalized hostname to server components
  // via a request header and rewrite `/` to the landing resolver. Deep links
  // like `/auth/*` are left untouched -- Phase 4 owns custom-host auth.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-host', host);

  if (pathname === '/' || pathname === '/index') {
    const url = request.nextUrl.clone();
    url.pathname = '/landing';
    url.searchParams.set('host', host);
    return NextResponse.rewrite(url, { request: { headers: requestHeaders } });
  }

  return NextResponse.next({ request: { headers: requestHeaders } });
}

export const config = {
  matcher: [
    // Exclude Next internals, api, static files from middleware execution.
    '/((?!api|_next/static|_next/image|favicon.ico|icon.svg).*)',
  ],
};
