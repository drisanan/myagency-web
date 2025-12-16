import { getAgencyByEmail } from '@/services/agencies';
import { loginWithGHL } from '@/services/authGHL';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

export type Session = {
  role: 'parent' | 'agency';
  agencyId?: string;
  email: string;
  agencyLogo?: string;
  impersonatedBy?: { email: string; role: 'parent' };
  contactId?: string;
};

async function postSession(session: Session) {
  if (!API_BASE_URL || typeof fetch === 'undefined') return null;
  const res = await fetch(`${API_BASE_URL}/auth/session`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      agencyId: session.agencyId,
      email: session.email,
      role: session.role,
      userId: session.contactId,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`auth session failed: ${res.status} ${txt}`);
  }
  return res.json();
}

export async function fetchSession(): Promise<Session | null> {
  if (!API_BASE_URL || typeof fetch === 'undefined') return null;
  try {
    const res = await fetch(`${API_BASE_URL}/auth/session`, { method: 'GET', credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.session ?? null;
  } catch {
    return null;
  }
}

export async function login(input: { email: string; phone: string; accessCode: string }): Promise<Session> {
  const result = await loginWithGHL(input.email.trim(), input.phone.trim(), input.accessCode.trim());
  if (!result.ok) {
    throw new Error(result.error);
  }
  const agency = await getAgencyByEmail(result.contact.email);
  const session: Session = {
    role: 'agency',
    email: result.contact.email,
    agencyId: agency?.id,
    contactId: result.contact.id,
  };
  // Issue session cookie via API if available
  await postSession(session).catch(() => null);
  return session;
}


