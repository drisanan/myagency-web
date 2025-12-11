'use client';
import React from 'react';
import type { Session } from '@/features/auth/service';

type Ctx = { session: Session | null; setSession: (s: Session | null) => void; loading: boolean };
const SessionCtx = React.createContext<Ctx | null>(null);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = React.useState<Session | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const raw = typeof window !== 'undefined' ? window.localStorage.getItem('session') : null;
    if (raw) setSession(JSON.parse(raw));
    setLoading(false);
  }, []);

  const set = React.useCallback((s: Session | null) => {
    setSession(s);
    if (typeof window !== 'undefined') {
      if (s) window.localStorage.setItem('session', JSON.stringify(s));
      else window.localStorage.removeItem('session');
    }
  }, []);

  return <SessionCtx.Provider value={{ session, setSession: set, loading }}>{children}</SessionCtx.Provider>;
}

export function useSession() {
  const ctx = React.useContext(SessionCtx);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}


