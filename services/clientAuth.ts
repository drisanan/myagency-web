const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL;

function requireApiBase() {
  if (!API_BASE_URL) throw new Error('API_BASE_URL is not configured');
  return API_BASE_URL;
}

export async function clientLogin(input: { email: string; phone: string; accessCode: string }) {
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
    const text = await res.text().catch(() => '');
    throw new Error(text || `Login failed ${res.status}`);
  }
  return res.json();
}

