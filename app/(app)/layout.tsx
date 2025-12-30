import React from 'react';
import { AppShell } from '@/app/app-shell';
import { AuthGuard } from './guard';
import { TourProvider } from '@/features/tour/TourProvider';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <TourProvider>
      <AuthGuard>
        <AppShell>{children}</AppShell>
      </AuthGuard>
    </TourProvider>
  );
}


