jest.mock('next/headers', () => ({
  headers: jest.fn()
}));

import { headers } from 'next/headers';
import { getServerTenant } from '@/tenancy/serverTenant';
import { getTenantRegistry } from '@/config';

describe('serverTenant', () => {
  test('resolves from host subdomain', async () => {
    (headers as unknown as jest.Mock).mockResolvedValue({
      get: (k: string) => (k === 'host' ? 'acme.example.com' : '')
    });
    const tenant = await getServerTenant();
    expect(tenant).toEqual(getTenantRegistry().acme);
  });

  test('falls back to default', async () => {
    (headers as unknown as jest.Mock).mockResolvedValue({
      get: (_k: string) => ''
    });
    const tenant = await getServerTenant();
    expect(tenant).toEqual(getTenantRegistry().default);
  });
});


