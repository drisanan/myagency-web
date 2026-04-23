import { getTenantRegistry } from '@/config';

/**
 * Tenant resolution by hostname/path.
 *
 * After Phase 2 the hardcoded `{default, acme}` registry was collapsed to a
 * single `default` entry. Real per-tenant identification happens in Phase 3
 * via `middleware.ts`, which looks up `DOMAIN#<hostname>` records on GSI1 and
 * rewrites requests to `/landing/<agencyId>`. These helpers remain as the
 * graceful-fallback path for anything the middleware does not resolve.
 */
export function resolveTenantFromHost(hostname: string): string {
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length > 2) {
    return parts[0];
  }
  return 'default';
}

export function resolveTenantFromPath(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts[0] === 't' && parts[1]) {
    return parts[1];
  }
  return 'default';
}

export function ensureKnownTenant(tenantId: string): string {
  const reg = getTenantRegistry();
  return reg[tenantId] ? tenantId : 'default';
}
