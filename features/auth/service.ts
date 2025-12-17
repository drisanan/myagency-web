import { getAgencyByEmail } from '@/services/agencies';
import { createAgencyFromGHL } from '@/services/agencies';
import { loginWithGHL } from '@/services/authGHL';

const NEXT_PUBLIC_API_BASE_URL='https://iakaowunc5.execute-api.us-west-1.amazonaws.com'
const API_BASE_URL = NEXT_PUBLIC_API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

export type Session = {
  role: 'parent' | 'agency';
  agencyId?: string;
  email: string;
  agencyLogo?: string;
  impersonatedBy?: { email: string; role: 'parent' };
  contactId?: string;
};

async function postSession(session: Session) {
  const base = requireApiBase();
  if (typeof fetch === 'undefined') return null;
  const res = await fetch(`${base}/auth/session`, {
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
  const base = requireApiBase();
  if (typeof fetch === 'undefined') return null;
  try {
    const res = await fetch(`${base}/auth/session`, { method: 'GET', credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data?.session ?? null;
  } catch {
    return null;
  }
}

export async function login(input: { email: string; phone: string; accessCode: string }): Promise<Session> {
  const base = requireApiBase();
  const result = await loginWithGHL(base, input.email.trim(), input.phone.trim(), input.accessCode.trim());
  if (!result.ok) {
    throw new Error(result.error);
  }
  console.log('result', JSON.stringify(result, null, 2));
  let agencyId = result.agency?.id;
  let agencyName = result.agency?.name;
  let agencyColor = result.agency?.color;
  let agencyLogo = result.agency?.logoUrl;
console.log('agencyId', agencyId);
console.log('agencyName', agencyName);
console.log('agencyColor', agencyColor);
console.log('agencyLogo', agencyLogo);
  if (agencyId === 'READY') {
    console.log('Creating new agency from GHL metadata');
    // Create new agency instance using GHL metadata
    const created = await createAgencyFromGHL({
      name: agencyName,
      email: result.contact.email,
      color: agencyColor,
      logoUrl: agencyLogo,
    });
    agencyId = created.id;
  }
  console.log('agencyId', agencyId);
  if (!agencyId) {
    const agency = await getAgencyByEmail(result.contact.email);
    agencyId = agency?.id;
  }

  // Final fallback: use contact email as agencyId to avoid missing field on session
  agencyId = agencyId || result.contact.email;
console.log('agencyId', agencyId);
  console.log('result.contact.email', result.contact.email);
  const session: Session = {
    role: 'agency',
    email: result.contact.email,
    agencyId,
    contactId: result.contact.id,
  };
  // Issue session cookie via API if available
  await postSession(session).catch(() => null);
  return session;
}


