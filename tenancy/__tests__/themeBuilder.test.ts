import { createTenantTheme } from '@/tenancy/themeBuilder';
import { TenantConfig } from '@/tenancy/types';

const acme: TenantConfig = {
  id: 'acme',
  name: 'Acme Athletics',
  brand: {
    primary: '#0A0A0A',
    secondary: '#CCFF00'
  },
  flags: {}
};

describe('themeBuilder', () => {
  test('builds MUI theme with tenant colors', () => {
    const theme = createTenantTheme(acme);
    expect(theme.palette.primary.main).toBe('#0A0A0A');
    expect(theme.palette.secondary.main).toBe('#CCFF00');
  });
});


