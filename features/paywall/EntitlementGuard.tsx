'use client';
import React from 'react';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { useQuery } from '@tanstack/react-query';
import { getEntitlement } from '@/features/paywall/service';

type Props = {
  feature: string;
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function EntitlementGuard({ feature, children, fallback }: Props) {
  const q = useQuery({
    queryKey: ['entitlement', feature],
    queryFn: () => getEntitlement(feature)
  });
  if (q.isLoading) return <CircularProgress role="progressbar" />;
  if (q.isError) return <Alert severity="error">Failed to check entitlement</Alert>;
  if (q.data?.entitled) return <>{children}</>;
  return <>{fallback ?? <Alert severity="info">Upgrade to access</Alert>}</>;
}


