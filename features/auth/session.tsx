'use client';
import React from 'react';
import type { Session } from '@/features/auth/service';
import { fetchSession } from '@/features/auth/service';

type Ctx = { session: Session | null; setSession: (s: Session | null) => void; loading: boolean };
const SessionCtx = React.createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      const apiSession = await fetchSession();
      if (!mounted) return;
      setSession(apiSession);
      setLoading(false);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const set = React.useCallback((s: Session | null) => {
    setSession(s);
  }, []);

  return <SessionCtx.Provider value={{ session, setSession: set, loading }}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  const ctx = React.useContext(SessionCtx);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
