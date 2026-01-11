import { getAgencyByEmail } from '@/services/agencies';
import { createAgencyFromGHL } from '@/services/agencies';
import { loginWithGHL } from '@/services/authGHL';

// Read env var directly like other services for consistent SSR/client behavior
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.myrecruiteragency.com';

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

export type AgencySettings = {
  primaryColor?: string;
  secondaryColor?: string;
  buttonText?: string;
  textPrimary?: string;
  textSecondary?: string;
  linkColor?: string;
  contentBg?: string;
  cardBg?: string;
  navText?: string;
  navActiveText?: string;
  navHoverBg?: string;
  successColor?: string;
  warningColor?: string;
  errorColor?: string;
  infoColor?: string;
  borderColor?: string;
  dividerColor?: string;
  logoDataUrl?: string;
  preferredSport?: string;
};

export type Session = {
  role: 'parent' | 'agency' | 'client';
  agencyId?: string;
  email: string;
  agencyEmail?: string;
  agencyLogo?: string;
  firstName?: string;
  lastName?: string;
  agencySettings?: AgencySettings;
  impersonatedBy?: { email: string; role: 'parent' | 'agency' };
  contactId?: string;
  clientId?: string;
  authEnabled?: boolean;
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
      firstName: session.firstName,
      lastName: session.lastName,
      agencyLogo: session.agencyLogo,
      agencySettings: session.agencySettings,
    }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`auth session failed: ${res.status} ${txt}`);
  }
  
  // LOCAL DEV WORKAROUND: If API sent custom header, manually set cookie
  // This bypasses Hapi's strict cookie validation in serverless-offline
  const localCookie = res.headers.get('X-Local-Set-Cookie');
  if (localCookie && typeof document !== 'undefined') {
    document.cookie = localCookie;
    console.log('[Local Auth] Cookie manually set from X-Local-Set-Cookie header');
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

  // Fetch agency settings for theming (all white-label colors)
  let agencySettings: AgencySettings | undefined = undefined;
  try {
    const agency = await getAgencyByEmail(result.contact.email);
    if (agency?.settings) {
      agencySettings = { ...agency.settings };
    }
  } catch (e) {
    console.error('Failed to fetch agency settings', e);
  }

  const session: Session = {
    role: 'agency',
    email: result.contact.email,
    agencyEmail: result.contact.email,
    agencyId,
    contactId: result.contact.id,
    firstName: result.contact.firstName,
    lastName: result.contact.lastName,
    agencyLogo: agencyLogo,
    agencySettings,
  };
  // Issue session cookie via API - this MUST succeed for persistent login
  try {
    await postSession(session);
    console.log('[Auth] Session cookie set successfully for:', session.email);
  } catch (err: any) {
    console.error('[Auth] CRITICAL: Failed to set session cookie:', err?.message);
  }
  return session;
}


