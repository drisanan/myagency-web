jest.mock('next/headers', () => ({
  headers: jest.fn(),
}));

import { headers } from 'next/headers';
import { getServerTenant } from '@/tenancy/serverTenant';
import { defaultBranding, getTenantRegistry } from '@/config';

describe('serverTenant', () => {
  test('returns the default branding for unknown hosts', async () => {
    (headers as unknown as jest.Mock).mockResolvedValue({
      get: (k: string) => (k === 'host' ? 'acme.example.com' : ''),
    });
    const tenant = await getServerTenant();
    // After Phase 2 the registry is just `{ default }`; real per-tenant
    // resolution is the job of Phase 3's middleware + DOMAIN# records.
    expect(tenant).toEqual(defaultBranding);
  });

  test('falls back to default when no host or path', async () => {
    (headers as unknown as jest.Mock).mockResolvedValue({
      get: (_k: string) => '',
    });
    const tenant = await getServerTenant();
    expect(tenant).toEqual(getTenantRegistry().default);
  });
});
