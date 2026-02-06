import React from 'react';
import type { Metadata } from 'next';
import { TenantThemeProvider } from '@/tenancy/TenantThemeProvider';
import { getServerTenant } from '@/tenancy/serverTenant';
import { Providers } from './providers';

export const metadata: Metadata = {
  title: 'My Recruiter Agency',
  description: 'Multi-tenant white-label web app',
  icons: {
    icon: '/icon.svg',
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const tenant = await getServerTenant();
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/marketing/fonts/bebas.css" />
      </head>
      <body>
        <Providers>
          <TenantThemeProvider tenant={tenant}>{children}</TenantThemeProvider>
        </Providers>
      </body>
    </html>
  );
}


