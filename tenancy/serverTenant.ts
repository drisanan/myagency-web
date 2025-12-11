import { headers } from 'next/headers';
import { getTenantRegistry } from '@/config';
import { ensureKnownTenant, resolveTenantFromHost, resolveTenantFromPath } from '@/tenancy/tenantResolver';

export async function getServerTenant() {
  const hdrs = await headers();
  const host = hdrs.get('host') || '';
  const path = hdrs.get('x-invoke-path') || ''; // non-standard, may be empty; fallback to default

  const fromHost = ensureKnownTenant(resolveTenantFromHost(host));
  if (fromHost !== 'default') {
    return getTenantRegistry()[fromHost];
  }
  const fromPath = ensureKnownTenant(resolveTenantFromPath(path));
  return getTenantRegistry()[fromPath];
}


