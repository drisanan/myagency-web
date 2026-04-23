import { LandingConfigInvalid, defaultLandingConfig, validateLandingConfig } from '../landingSchema';

describe('validateLandingConfig', () => {
  it('returns {} for null/undefined', () => {
    expect(validateLandingConfig(null)).toEqual({});
    expect(validateLandingConfig(undefined)).toEqual({});
  });

  it('rejects non-object input', () => {
    expect(() => validateLandingConfig('oops')).toThrow(LandingConfigInvalid);
    expect(() => validateLandingConfig(['a'])).toThrow(LandingConfigInvalid);
  });

  it('rejects unknown templateId', () => {
    expect(() => validateLandingConfig({ templateId: 'bogus' })).toThrow(/templateId/);
  });

  it('accepts valid full payload', () => {
    const out = validateLandingConfig({
      templateId: 'recruiterBold',
      seo: { title: 'A', description: 'B' },
      hero: { headline: 'H', subhead: 'S', ctaLabel: 'Go', ctaHref: '/start' },
      features: [{ title: 'T', body: 'B' }],
      testimonials: [{ quote: 'Q', author: 'A', role: 'R' }],
      footer: { legal: 'L', links: [{ label: 'Terms', href: 'https://example.com/terms' }] },
    });
    expect(out.templateId).toBe('recruiterBold');
    expect(out.hero?.ctaHref).toBe('/start');
    expect(out.features).toHaveLength(1);
    expect(out.footer?.links?.[0].href).toBe('https://example.com/terms');
  });

  function expectCode(fn: () => unknown, code: string) {
    try {
      fn();
      throw new Error(`Expected throw with code ${code}`);
    } catch (err) {
      expect(err).toBeInstanceOf(LandingConfigInvalid);
      expect((err as LandingConfigInvalid).code).toBe(code);
    }
  }

  it('rejects non-https external hrefs', () => {
    expectCode(
      () =>
        validateLandingConfig({
          footer: { links: [{ label: 'x', href: 'http://insecure.example.com' }] },
        }),
      'UNSAFE_HREF',
    );
  });

  it('caps text length', () => {
    const long = 'x'.repeat(500);
    expectCode(() => validateLandingConfig({ hero: { headline: long } }), 'TOO_LONG');
  });

  it('caps array length', () => {
    const tooMany = Array.from({ length: 11 }, (_, i) => ({
      title: `t${i}`,
      body: `b${i}`,
    }));
    expectCode(() => validateLandingConfig({ features: tooMany }), 'TOO_MANY');
  });

  it('requires title + body for features', () => {
    expectCode(
      () => validateLandingConfig({ features: [{ title: 'only' }] }),
      'REQUIRED',
    );
  });

  it('requires quote + author for testimonials', () => {
    expectCode(
      () => validateLandingConfig({ testimonials: [{ quote: 'only' }] }),
      'REQUIRED',
    );
  });
});

describe('defaultLandingConfig', () => {
  it('returns an athleteClassic default with headline = agency name', () => {
    const out = defaultLandingConfig('Acme Recruiting');
    expect(out.templateId).toBe('athleteClassic');
    expect(out.hero?.headline).toBe('Acme Recruiting');
  });
});
