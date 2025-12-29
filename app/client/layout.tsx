'use client';
import React from 'react';
import { SessionProvider, useSession } from '@/features/auth/session';
import { useRouter } from 'next/navigation';

function Guard({ children }: { children: React.ReactNode }) {
  const { session, loading } = useSession();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && (!session || session.role !== 'client')) {
      router.push('/auth/client-login');
    }
  }, [loading, session, router]);

  if (loading || !session || session.role !== 'client') {
    return <div style={{ padding: 24, fontFamily: 'sans-serif' }}>Loading…</div>;
  }

  return <>{children}</>;
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <Guard>
        <div style={{ fontFamily: 'sans-serif' }}>
          <header style={{ padding: '12px 16px', borderBottom: '1px solid #eee' }}>
            <strong>Client Portal</strong> — Lists
          </header>
          <main style={{ padding: 16 }}>{children}</main>
        </div>
      </Guard>
    </SessionProvider>
  );
}

