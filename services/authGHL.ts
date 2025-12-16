'use client';

export type GHLLoginResult =
  | { ok: true; contact: { id: string; email: string; firstName?: string; lastName?: string; phone?: string; accessCode: string } }
  | { ok: false; error: string };

export async function loginWithGHL(email: string, phone: string, accessCodeInput: string): Promise<GHLLoginResult> {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;
  try {
    const endpoint = API_BASE_URL ? `${API_BASE_URL}/auth/ghl-login` : '/api/auth/ghl-login';
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: API_BASE_URL ? 'include' : 'same-origin',
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

