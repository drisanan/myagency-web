import React from 'react';
import type { Metadata } from 'next';
import { TenantThemeProvider } from '@/tenancy/TenantThemeProvider';
import { getServerTenant } from '@/tenancy/serverTenant';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'AthleteNarrative Web',
  description: 'Multi-tenant white-label web app'
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getServerTenant();
  return (
    <html lang="en">
      <body>
        <Providers>
          <TenantThemeProvider tenant={tenant}>{children}</TenantThemeProvider>
        </Providers>
      </body>
    </html>
  );
}


