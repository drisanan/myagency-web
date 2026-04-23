/**
 * Phase 4 custom-host sign-in: post-login redirect helper.
 *
 * The canonical login page accepts a `?return_to=<absolute-url>` query param.
 * After a successful session mint:
 *   - If return_to points to the canonical host (or is a relative path),
 *     we just router.push() / window.location.assign() to it locally.
 *   - If return_to points to a non-canonical host, we call the backend
 *     /auth/handoff endpoint which validates the host (via DOMAIN# table)
 *     and returns a `redirectUrl` we then jump to. The custom host's
 *     /auth/handoff page finishes the exchange.
 *
 * This helper is client-only.
 */

const DEFAULT_CANONICAL_HOSTS = [
  'myrecruiteragency.com',
  'app.myrecruiteragency.com',
  'www.myrecruiteragency.com',
];

function getCanonicalHosts(): string[] {
  const raw = process.env.NEXT_PUBLIC_CANONICAL_HOSTS?.trim();
  if (!raw) return DEFAULT_CANONICAL_HOSTS;
  return raw.split(',').map((h) => h.trim().toLowerCase()).filter(Boolean);
}

export function isCanonicalHost(host: string): boolean {
  return getCanonicalHosts().includes(host.toLowerCase());
}

export function parseReturnTo(raw: string | null | undefined): URL | null {
  if (!raw) return null;
  try {
    if (raw.startsWith('/')) {
      if (typeof window === 'undefined') return null;
      return new URL(raw, window.location.origin);
    }
    const url = new URL(raw);
    if (url.protocol !== 'https:' && url.protocol !== 'http:') return null;
    return url;
  } catch {
    return null;
  }
}

type HandoffResponse = {
  ok: boolean;
  redirectUrl?: string;
  targetHost?: string;
  error?: string;
  code?: string;
};

async function fetchHandoffRedirect(returnTo: string): Promise<HandoffResponse> {
  const base = process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.myrecruiteragency.com';
  const url = new URL(`${base}/auth/handoff`);
  url.searchParams.set('return_to', returnTo);
  const res = await fetch(url.toString(), {
    method: 'GET',
    credentials: 'include',
  });
  const data = (await res.json().catch(() => ({}))) as HandoffResponse;
  if (!res.ok || !data.ok) {
    return { ok: false, error: data?.error || `HTTP ${res.status}`, code: data?.code };
  }
  return data;
}

/**
 * After a successful login, call this with the desired return destination.
 * - Returns an action plan the caller can execute, without directly coupling
 *   to Next's router: `{ kind: 'local', path }` or `{ kind: 'external', url }`.
 * - Throws on custom-host handoff failures so the caller can surface them.
 */
export async function resolvePostLoginRedirect(
  returnToRaw: string | null,
  fallbackPath: string,
): Promise<{ kind: 'local'; path: string } | { kind: 'external'; url: string }> {
  const parsed = parseReturnTo(returnToRaw);

  if (!parsed) return { kind: 'local', path: fallbackPath };

  if (typeof window !== 'undefined' && parsed.hostname === window.location.hostname) {
    return { kind: 'local', path: parsed.pathname + parsed.search };
  }

  if (isCanonicalHost(parsed.hostname)) {
    return { kind: 'external', url: parsed.toString() };
  }

  const handoff = await fetchHandoffRedirect(parsed.toString());
  if (!handoff.ok || !handoff.redirectUrl) {
    throw new Error(handoff.error || 'Handoff failed');
  }
  return { kind: 'external', url: handoff.redirectUrl };
}
