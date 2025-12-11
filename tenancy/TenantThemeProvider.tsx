'use client';
import React from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { createTenantTheme } from '@/tenancy/themeBuilder';
import { TenantConfig } from '@/tenancy/types';
import { TenantProvider } from '@/tenancy/TenantContext';

type Props = {
  tenant: TenantConfig;
  children: React.ReactNode;
};

export function TenantThemeProvider({ tenant, children }: Props) {
  const theme = React.useMemo(() => createTenantTheme(tenant), [tenant]);
  return (
    <TenantProvider tenant={tenant}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </TenantProvider>
  );
}


