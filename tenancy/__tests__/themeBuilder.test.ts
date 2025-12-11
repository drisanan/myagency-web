import { createTenantTheme } from '@/tenancy/themeBuilder';
import { TenantConfig } from '@/tenancy/types';

const acme: TenantConfig = {
  id: 'acme',
  name: 'Acme Athletics',
  brand: {
    primary: '#1976d2',
    secondary: '#ff4081'
  },
  flags: {}
};

describe('themeBuilder', () => {
  test('builds MUI theme with tenant colors', () => {
    const theme = createTenantTheme(acme);
    expect(theme.palette.primary.main).toBe('#1976d2');
    expect(theme.palette.secondary.main).toBe('#ff4081');
  });
});


