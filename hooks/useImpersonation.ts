/**
 * useImpersonation Hook
 * Enables agency users to impersonate their athlete clients
 * 
 * Features:
 * - Switch session to client role with athlete data
 * - Preserve agency settings for white-label theming
 * - Audit logging for compliance
 * - One-click stop impersonation
 */
import { useSession } from '@/features/auth/session';
import { useRouter } from 'next/navigation';
import { logImpersonationStart, logImpersonationEnd } from '@/services/audit';

const STORAGE_KEY = 'session_impersonation_base';
const IMPERSONATION_SESSION_KEY = 'session_impersonation_active';

type ImpersonateClientInput = {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
};

export function useImpersonation() {
  const { session, setSession } = useSession();
  const router = useRouter();

  /**
   * Impersonate a client (athlete)
   * - Only works for agency role
   * - No nested impersonation allowed
   */
  const impersonateClient = (client: ImpersonateClientInput) => {
    // Guard: must be agency
    if (!session || session.role !== 'agency') return;
    
    // Guard: no nested impersonation
    if (session.impersonatedBy) return;

    // Save current session for restoration
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    }

    // Log audit event
    logImpersonationStart(session.email, client.email);

    // Switch to client session (preserving agency theming)
    setSession({
      role: 'client',
      email: client.email,
      clientId: client.id,
      agencyId: session.agencyId,
      agencyEmail: session.agencyEmail || session.email,
      firstName: client.firstName,
      lastName: client.lastName,
      agencySettings: session.agencySettings,
      agencyLogo: session.agencyLogo,
      impersonatedBy: { email: session.email, role: 'agency' },
    });

    // Navigate to client portal
    router.push('/client/lists');
  };

  /**
   * Stop impersonation and restore original agency session
   */
  const stopImpersonation = () => {
    if (typeof window === 'undefined') return;

    const baseRaw = window.localStorage.getItem(STORAGE_KEY);
    if (!baseRaw || !session?.impersonatedBy) return;

    const base = JSON.parse(baseRaw);

    // Log audit event
    logImpersonationEnd(base.email, session.email);

    // Clear impersonation storage BEFORE setting session
    // This prevents race conditions with other SessionProviders
    window.localStorage.removeItem(STORAGE_KEY);
    window.localStorage.removeItem(IMPERSONATION_SESSION_KEY);

    // Restore original session
    setSession(base);

    // Navigate back to clients list
    router.push('/clients');
  };

  return {
    impersonateClient,
    stopImpersonation,
    isImpersonating: Boolean(session?.impersonatedBy),
    impersonatedBy: session?.impersonatedBy,
  };
}

