import { getTenantRegistry } from '@/config';

export function resolveTenantFromHost(hostname: string): string {
  // e.g., acme.example.com -> acme
  const parts = hostname.split('.').filter(Boolean);
  if (parts.length > 2) {
    return parts[0];
  }
  // if hostname is localhost or root domain, use default
  return 'default';
}

export function resolveTenantFromPath(pathname: string): string {
  // /t/<tenantId>/... -> <tenantId>
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


