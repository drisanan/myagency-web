import { resolveTenantFromHost, resolveTenantFromPath } from '@/tenancy/tenantResolver';

describe('tenantResolver', () => {
  test('resolves tenant from hostname (subdomain)', () => {
    const tenant = resolveTenantFromHost('acme.example.com');
    expect(tenant).toEqual('acme');
  });

  test('resolves default tenant when no subdomain', () => {
    const tenant = resolveTenantFromHost('example.com');
    expect(tenant).toEqual('default');
  });

  test('resolves tenant from path prefix fallback', () => {
    const tenant = resolveTenantFromPath('/t/omega/dashboard');
    expect(tenant).toEqual('omega');
  });

  test('returns default when no path prefix', () => {
    const tenant = resolveTenantFromPath('/dashboard');
    expect(tenant).toEqual('default');
  });
});


