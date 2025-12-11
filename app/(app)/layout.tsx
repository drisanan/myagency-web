import React from 'react';
import { AppShell } from '@/app/app-shell';
import { AuthGuard } from './guard';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <AuthGuard><AppShell>{children}</AppShell></AuthGuard>;
}


