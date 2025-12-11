'use client';
import React from 'react';
import Alert from '@mui/material/Alert';
import { useTenant } from '@/tenancy/TenantContext';

export function AICounselorGate({ children }: { children: React.ReactNode }) {
  const tenant = useTenant();
  if (!tenant.flags.aiCounselor) {
    return <Alert severity="info">AI Counselor is disabled for this tenant</Alert>;
  }
  return <>{children}</>;
}


