'use client';
import React from 'react';
import { TenantConfig } from '@/tenancy/types';

const TenantCtx = React.createContext<TenantConfig | null>(null);

export function TenantProvider({ tenant, children }: { tenant: TenantConfig; children: React.ReactNode }) {
  return <TenantCtx.Provider value={tenant}>{children}</TenantCtx.Provider>;
}

export function useTenant(): TenantConfig {
  const ctx = React.useContext(TenantCtx);
  if (!ctx) throw new Error('useTenant must be used within TenantProvider');
  return ctx;
}


