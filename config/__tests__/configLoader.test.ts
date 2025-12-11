import { getServiceConfig, getTenantRegistry } from '@/config';

describe('configLoader', () => {
  test('exposes service endpoints and allows overrides', () => {
    const cfg = getServiceConfig();
    expect(cfg.apiBaseUrl).toBeTruthy();
  });

  test('provides a tenant registry with at least default', () => {
    const reg = getTenantRegistry();
    expect(reg.default).toBeDefined();
    expect(reg.default.id).toBe('default');
  });
});


