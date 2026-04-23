/**
 * @jest-environment jsdom
 */

import { isCanonicalHost, parseReturnTo, resolvePostLoginRedirect } from '../handoffRedirect';

const origEnv = { ...process.env };

describe('isCanonicalHost', () => {
  it('matches defaults', () => {
    expect(isCanonicalHost('myrecruiteragency.com')).toBe(true);
    expect(isCanonicalHost('app.myrecruiteragency.com')).toBe(true);
    expect(isCanonicalHost('pilot1.myrecruiteragency.com')).toBe(false);
  });

  it('honors NEXT_PUBLIC_CANONICAL_HOSTS override', () => {
    process.env.NEXT_PUBLIC_CANONICAL_HOSTS = 'foo.example.com';
    expect(isCanonicalHost('foo.example.com')).toBe(true);
    expect(isCanonicalHost('myrecruiteragency.com')).toBe(false);
    process.env = { ...origEnv };
  });
});

describe('parseReturnTo', () => {
  it('returns null for empty / bad input', () => {
    expect(parseReturnTo(null)).toBeNull();
    expect(parseReturnTo('')).toBeNull();
    expect(parseReturnTo('::not a url')).toBeNull();
  });

  it('resolves absolute URLs', () => {
    const u = parseReturnTo('https://pilot1.myrecruiteragency.com/dashboard');
    expect(u?.hostname).toBe('pilot1.myrecruiteragency.com');
    expect(u?.pathname).toBe('/dashboard');
  });

  it('resolves relative paths against window.location.origin', () => {
    const u = parseReturnTo('/dashboard');
    expect(u?.pathname).toBe('/dashboard');
  });
});

describe('resolvePostLoginRedirect', () => {
  const origFetch = global.fetch;

  afterEach(() => {
    global.fetch = origFetch;
    jest.clearAllMocks();
  });

  it('returns fallback local path when return_to missing', async () => {
    const plan = await resolvePostLoginRedirect(null, '/dashboard');
    expect(plan).toEqual({ kind: 'local', path: '/dashboard' });
  });

  it('routes same-host return_to as local', async () => {
    const plan = await resolvePostLoginRedirect('/settings?tab=x', '/dashboard');
    expect(plan).toEqual({ kind: 'local', path: '/settings?tab=x' });
  });

  it('returns canonical absolute url as external without handoff call', async () => {
    const plan = await resolvePostLoginRedirect(
      'https://app.myrecruiteragency.com/dashboard',
      '/dashboard',
    );
    expect(plan.kind).toBe('external');
  });

  it('calls /auth/handoff for non-canonical return_to and returns redirectUrl', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        ok: true,
        redirectUrl: 'https://pilot1.myrecruiteragency.com/auth/handoff?token=x',
      }),
    }) as unknown as typeof fetch;

    const plan = await resolvePostLoginRedirect(
      'https://pilot1.myrecruiteragency.com/dashboard',
      '/dashboard',
    );
    expect(plan).toEqual({
      kind: 'external',
      url: 'https://pilot1.myrecruiteragency.com/auth/handoff?token=x',
    });
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('throws when /auth/handoff denies the host', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => ({ ok: false, error: 'nope', code: 'ERR_HANDOFF_HOST_NOT_ATTACHED' }),
    }) as unknown as typeof fetch;

    await expect(
      resolvePostLoginRedirect(
        'https://pilot1.myrecruiteragency.com/dashboard',
        '/dashboard',
      ),
    ).rejects.toThrow('nope');
  });
});
