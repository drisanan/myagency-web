'use client';
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import type { Session } from '@/features/auth/service';
import { fetchSession } from '@/features/auth/service';

const IMPERSONATION_SESSION_KEY = 'session_impersonation_active';

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
  const [session, setSessionState] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  // Wrapped setSession that persists impersonated sessions to localStorage
  const setSession = useCallback((s: Session | null) => {
    if (typeof window !== 'undefined') {
      if (s?.impersonatedBy) {
        // Persist impersonated session so other SessionProviders can read it
        window.localStorage.setItem(IMPERSONATION_SESSION_KEY, JSON.stringify(s));
      } else {
        // Clear impersonation when setting a non-impersonated session
        window.localStorage.removeItem(IMPERSONATION_SESSION_KEY);
      }
    }
    setSessionState(s);
  }, []);

  const refreshSession = async () => {
    try {
      setLoading(true);
      
      // Check for active impersonation in localStorage first
      if (typeof window !== 'undefined') {
        const impersonatedRaw = window.localStorage.getItem(IMPERSONATION_SESSION_KEY);
        if (impersonatedRaw) {
          try {
            const impersonatedSession = JSON.parse(impersonatedRaw);
            if (impersonatedSession?.impersonatedBy) {
              setSessionState(impersonatedSession);
              setLoading(false);
              return;
            }
          } catch {
            // Invalid JSON, clear it
            window.localStorage.removeItem(IMPERSONATION_SESSION_KEY);
          }
        }
      }
      
      // No active impersonation, fetch from API
      const apiSession = await fetchSession();
      setSessionState(apiSession);
    } catch (err) {
      console.error('Session fetch failed', err);
      setSessionState(null);
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
