import React from 'react';
import { AppShell } from '@/app/app-shell';
import { AuthGuard } from './guard';
import { TourProvider } from '@/features/tour/TourProvider';
import { DynamicThemeProvider } from '@/features/theme/DynamicThemeProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider>
      <AuthGuard>
        <DynamicThemeProvider>
          <AppShell>{children}</AppShell>
        </DynamicThemeProvider>
      </AuthGuard>
    </TourProvider>
  );
}


