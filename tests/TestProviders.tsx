import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TenantThemeProvider } from '@/tenancy/TenantThemeProvider';
import { getTenantRegistry } from '@/config';

type Props = { children: React.ReactNode };

export function TestProviders({ children }: Props) {
  const [client] = React.useState(() => new QueryClient());
  const tenant = getTenantRegistry().default;
  return (
    <QueryClientProvider client={client}>
      <TenantThemeProvider tenant={tenant}>{children}</TenantThemeProvider>
    </QueryClientProvider>
  );
}


