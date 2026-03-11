const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

export type ClientLoginResult = {
  ok: boolean;
  session?: {
    role: 'client';
    agencyId: string;
    agencyEmail: string;
    email: string;
    clientId: string;
    firstName: string;
    lastName: string;
    agencyLogo?: string;
    agencySettings?: Record<string, string | undefined>;
  };
  error?: string;
};

export async function clientLogin(input: { email: string; phone: string; accessCode: string }): Promise<ClientLoginResult> {
  const base = requireApiBase();
  const res = await fetch(`${base}/auth/client-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify({
      email: input.email,
      phone: input.phone,
      accessCode: input.accessCode,
    }),
  });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data?.error || `Login failed ${res.status}`);
  }
  
  // LOCAL DEV WORKAROUND: If API sent custom header, manually set cookie
  const localCookie = res.headers.get('X-Local-Set-Cookie');
  if (localCookie && typeof document !== 'undefined') {
    const jsCompatibleCookie = localCookie
      .replace(/;\s*HttpOnly/gi, '')
      .replace(/;\s*Secure/gi, '');
    document.cookie = jsCompatibleCookie;
    console.log('[Local Auth] Client cookie manually set from X-Local-Set-Cookie header');
  }
  
  return res.json();
}

