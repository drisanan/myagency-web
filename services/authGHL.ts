'use client';

export type GHLLoginResult =
  | { ok: true; contact: { id: string; email: string; firstName?: string; lastName?: string; phone?: string; accessCode: string } }
  | { ok: false; error: string };

export async function loginWithGHL(apiBase: string, email: string, phone: string, accessCodeInput: string): Promise<GHLLoginResult> {
  if (!apiBase) throw new Error('API_BASE_URL is not configured');
  try {
    const endpoint = `${apiBase}/auth/ghl-login`;
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, phone, accessCode: accessCodeInput }),
    });
    const data = await res.json();
    if (!res.ok || !data?.ok) {
      return { ok: false, error: data?.error || 'Login failed' };
    }
    return { ok: true, contact: data.contact };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'Login failed' };
  }
}

