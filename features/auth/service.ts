import { getAgencyByEmail } from '@/services/agencies';
import { createAgencyFromGHL } from '@/services/agencies';
import { loginWithGHL } from '@/services/authGHL';

// Read env var directly like other services for consistent SSR/client behavior
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.myrecruiteragency.com';

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

export type ProgramLevelConfig = {
  value: string;      // Internal key (e.g., 'bronze', 'tier1')
  label: string;      // Display name (e.g., 'Bronze', 'Basic Plan')
  color: string;      // Hex color for UI
};

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
  // Program level customization
  programLevels?: ProgramLevelConfig[];
};

export type SubscriptionLevel = 'starter' | 'unlimited';

export const STARTER_USER_LIMIT = 25;

export type Session = {
  role: 'parent' | 'agency' | 'client' | 'agent';
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
  agentId?: string;       // Set when logged in as agent
  agentEmail?: string;    // Agent's own email
  authEnabled?: boolean;
  subscriptionLevel?: SubscriptionLevel;
  currentUserCount?: number;
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
    // Strip HttpOnly (can't set via JS) and Secure (not on localhost)
    const jsCompatibleCookie = localCookie
      .replace(/;\s*HttpOnly/gi, '')
      .replace(/;\s*Secure/gi, '');
    document.cookie = jsCompatibleCookie;
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
    const session = data?.session;
    if (!session) return null;
    
    // Ensure 'email' field is populated (backend may send agentEmail/agencyEmail separately)
    // For agents: use agentEmail (their own email)
    // For agencies: use agencyEmail (which is their email)
    // Fallback chain: email -> agentEmail -> agencyEmail
    if (!session.email) {
      session.email = session.agentEmail || session.agencyEmail || '';
    }
    
    return session as Session;
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

/**
 * Login as an agent (sub-account of agency)
 * Agent must have authEnabled=true and valid accessCode set by agency
 * Can use either agencyId (UUID) or agencySlug (friendly name)
 */
export async function agentLogin(input: { 
  agencyId?: string;
  agencySlug?: string;
  email: string; 
  phone: string; 
  accessCode: string;
}): Promise<{ ok: boolean; error?: string; agent?: any }> {
  const base = requireApiBase();
  
  const res = await fetch(`${base}/auth/agent-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      ...(input.agencyId ? { agencyId: input.agencyId.trim() } : {}),
      ...(input.agencySlug ? { agencySlug: input.agencySlug.trim().toLowerCase() } : {}),
      email: input.email.trim(),
      phone: input.phone.trim(),
      accessCode: input.accessCode.trim(),
    }),
  });

  const data = await res.json();
  
  if (!res.ok || !data.ok) {
    return { ok: false, error: data.error || 'Login failed' };
  }

  // LOCAL DEV WORKAROUND: If API sent custom header, manually set cookie
  const localCookie = res.headers.get('X-Local-Set-Cookie');
  if (localCookie && typeof document !== 'undefined') {
    const jsCompatibleCookie = localCookie
      .replace(/;\s*HttpOnly/gi, '')
      .replace(/;\s*Secure/gi, '');
    document.cookie = jsCompatibleCookie;
    console.log('[Local Auth] Agent cookie manually set from X-Local-Set-Cookie header');
  }

  return { ok: true, agent: data.agent };
}
