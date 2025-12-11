'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/features/auth/session';

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();
  React.useEffect(() => { if (!loading && !session) router.replace('/auth/login'); }, [loading, session, router]);
  if (loading) return null;
  return <>{children}</>;
}


