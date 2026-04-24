import {
  resolveLandingByAgencyId,
  resolveLandingByHostname,
} from '../landingResolver';

type FetchArgs = {
  input: RequestInfo | URL;
  init?: RequestInit;
};

const calls: FetchArgs[] = [];
let nextResponse: (() => Response | Promise<Response>) | null = null;

beforeEach(() => {
  calls.length = 0;
  nextResponse = null;
  (global as unknown as { fetch: typeof fetch }).fetch = (async (
    input: RequestInfo | URL,
    init?: RequestInit,
  ) => {
    calls.push({ input, init });
    if (!nextResponse) {
      throw new Error('fetch called but no stub configured');
    }
    return nextResponse();
  }) as typeof fetch;
});

function stubJson(status: number, body: unknown) {
  // Use a hand-rolled Response-like object — jsdom's `Response.json()`
  // is finicky across versions, and this keeps the test insulated from
  // runtime variation. The resolver only touches `.status`, `.ok`, `.json()`.
  nextResponse = () =>
    ({
      status,
      ok: status >= 200 && status < 300,
      headers: new Headers({ 'content-type': 'application/json' }),
      async json() {
        return body;
      },
    }) as unknown as Response;
}

function stubNetworkError() {
  nextResponse = () => {
    throw new Error('network boom');
  };
}

const landingBody = {
  ok: true,
  agency: {
    id: 'a1',
    name: 'Acme Recruiting',
    slug: 'acme',
    settings: {
      primaryColor: '#111',
      landing: {
        templateId: 'athleteClassic',
        hero: { headline: 'Welcome' },
      },
    },
  },
  domain: {
    PK: 'AGENCY#a1',
    SK: 'DOMAIN#app.acme.com',
    GSI1PK: 'DOMAIN#app.acme.com',
    GSI1SK: 'AGENCY#a1',
    id: 'a1:app.acme.com',
    agencyId: 'a1',
    hostname: 'app.acme.com',
    status: 'ACTIVE',
    createdAt: 1,
    updatedAt: 2,
  },
  landing: {
    templateId: 'athleteClassic',
    hero: { headline: 'Welcome' },
  },
  isPreview: false,
  activeCustomHostname: 'app.acme.com',
};

describe('landingResolver.resolveLandingByHostname', () => {
  it('returns null for empty hostname without fetching', async () => {
    const result = await resolveLandingByHostname('');
    expect(result).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it('returns null on 404 (no DOMAIN# record)', async () => {
    stubJson(404, { ok: false, code: 'ERR_NOT_FOUND' });
    const result = await resolveLandingByHostname('missing.example.com');
    expect(result).toBeNull();
    expect(calls).toHaveLength(1);
    const url = String(calls[0].input);
    expect(url).toContain('/landing?');
    expect(url).toContain('host=missing.example.com');
  });

  it('returns null on 500 (upstream failure)', async () => {
    stubJson(500, { ok: false });
    const result = await resolveLandingByHostname('err.example.com');
    expect(result).toBeNull();
  });

  it('returns null on network error', async () => {
    stubNetworkError();
    const result = await resolveLandingByHostname('err.example.com');
    expect(result).toBeNull();
  });

  it('resolves an active host to agency + landing', async () => {
    stubJson(200, landingBody);
    const result = await resolveLandingByHostname('APP.acme.com.');
    expect(result).not.toBeNull();
    expect(result?.agency.id).toBe('a1');
    expect(result?.agency.name).toBe('Acme Recruiting');
    expect(result?.landing.hero?.headline).toBe('Welcome');
    expect(result?.domain.hostname).toBe('app.acme.com');
    expect(result?.isPreview).toBe(false);
    expect(result?.activeCustomHostname).toBe('app.acme.com');
    expect(calls).toHaveLength(1);
  });
});

describe('landingResolver.resolveLandingByAgencyId', () => {
  it('returns null for empty id without fetching', async () => {
    const result = await resolveLandingByAgencyId('');
    expect(result).toBeNull();
    expect(calls).toHaveLength(0);
  });

  it('resolves preview mode via agencyId', async () => {
    stubJson(200, {
      ...landingBody,
      domain: { ...landingBody.domain, hostname: '__preview__', SK: 'DOMAIN#__preview__' },
      isPreview: true,
      activeCustomHostname: null,
    });
    const result = await resolveLandingByAgencyId('a1');
    expect(result?.domain.hostname).toBe('__preview__');
    expect(result?.isPreview).toBe(true);
    expect(result?.activeCustomHostname).toBeNull();
    expect(String(calls[0].input)).toContain('agencyId=a1');
  });
});
