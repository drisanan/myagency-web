'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';
import type { Session } from '@/features/auth/service';
import { fetchSession } from '@/features/auth/service';

type SessionContextType = {
  session: Session | null;
  loading: boolean;
  refreshSession: () => Promise<void>;
  setSession: (s: Session | null) => void;
};

const SessionCtx = createContext<SessionContextType>({
  session: null,
  loading: true,
  refreshSession: async () => {},
  setSession: () => {},
});

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = async () => {
    try {
      setLoading(true);
      const apiSession = await fetchSession();
      setSession(apiSession);
    } catch (err) {
      console.error('Session fetch failed', err);
      setSession(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshSession();
  }, []);

  return (
    <SessionCtx.Provider value={{ session, loading, refreshSession, setSession }}>
      {children}
    </SessionCtx.Provider>
  );
}

export function useSession() {
  const ctx = useContext(SessionCtx);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
