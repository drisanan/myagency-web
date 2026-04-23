/**
 * Phase 6 landing config schema + validator.
 *
 * `AgencyLandingConfig` (declared in `infra/src/lib/models.ts`) is the single
 * source of truth for the white-label landing surface. This module owns the
 * runtime validation that both the settings UI and the PUT /agencies/settings
 * handler funnel writes through, so we never persist arbitrary shapes under
 * `settings.landing`.
 *
 * Constraints enforced here (kept deliberately strict for v1):
 *   - templateId must be one of the 3 published templates.
 *   - All text fields have conservative length caps so a malicious tenant
 *     cannot balloon the agency record size.
 *   - CTA hrefs must be https or root-relative.
 *   - Feature / testimonial / footer-link arrays have count caps.
 */

import type { AgencyLandingConfig } from '../infra/src/lib/models';
import type { TemplateId } from '../features/whitelabel/templates/types';

export const TEMPLATE_IDS: TemplateId[] = ['athleteClassic', 'recruiterBold', 'minimalDark'];

const TEXT_LIMITS = {
  headline: 160,
  subhead: 280,
  cta: 40,
  seoTitle: 120,
  seoDescription: 280,
  featureTitle: 80,
  featureBody: 280,
  testimonialQuote: 400,
  testimonialAuthor: 80,
  testimonialRole: 120,
  footerLegal: 280,
  footerLink: 80,
} as const;

const MAX_FEATURES = 9;
const MAX_TESTIMONIALS = 9;
const MAX_FOOTER_LINKS = 6;

export class LandingConfigInvalid extends Error {
  path: string;
  code: string;
  constructor(code: string, path: string, message: string) {
    super(`${path}: ${message}`);
    this.name = 'LandingConfigInvalid';
    this.code = code;
    this.path = path;
  }
}

function expectString(
  value: unknown,
  path: string,
  maxLen: number,
): string | undefined {
  if (value == null) return undefined;
  if (typeof value !== 'string') {
    throw new LandingConfigInvalid('NOT_STRING', path, 'must be a string');
  }
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  if (trimmed.length > maxLen) {
    throw new LandingConfigInvalid(
      'TOO_LONG',
      path,
      `must be ${maxLen} characters or fewer`,
    );
  }
  return trimmed;
}

function expectHref(value: unknown, path: string): string | undefined {
  const str = expectString(value, path, 500);
  if (!str) return undefined;
  if (str.startsWith('/') && !str.startsWith('//')) return str;
  try {
    const url = new URL(str);
    if (url.protocol !== 'https:') {
      throw new LandingConfigInvalid('UNSAFE_HREF', path, 'must be https:// or a /-rooted path');
    }
    return url.toString();
  } catch (err) {
    if (err instanceof LandingConfigInvalid) throw err;
    throw new LandingConfigInvalid('BAD_HREF', path, 'not a valid URL');
  }
}

function expectArray<T>(
  value: unknown,
  path: string,
  max: number,
  item: (v: unknown, i: number) => T,
): T[] | undefined {
  if (value == null) return undefined;
  if (!Array.isArray(value)) {
    throw new LandingConfigInvalid('NOT_ARRAY', path, 'must be an array');
  }
  if (value.length > max) {
    throw new LandingConfigInvalid('TOO_MANY', path, `maximum ${max} entries`);
  }
  return value.map(item);
}

/**
 * Validate + normalize a landing config payload. Returns a fresh object that
 * can be safely persisted. Throws `LandingConfigInvalid` on any violation.
 */
export function validateLandingConfig(input: unknown): AgencyLandingConfig {
  if (input == null) return {};
  if (typeof input !== 'object' || Array.isArray(input)) {
    throw new LandingConfigInvalid('NOT_OBJECT', 'landing', 'must be an object');
  }
  const obj = input as Record<string, unknown>;
  const out: AgencyLandingConfig = {};

  if (obj.templateId !== undefined) {
    if (typeof obj.templateId !== 'string' || !TEMPLATE_IDS.includes(obj.templateId as TemplateId)) {
      throw new LandingConfigInvalid(
        'BAD_TEMPLATE',
        'landing.templateId',
        `must be one of ${TEMPLATE_IDS.join(', ')}`,
      );
    }
    out.templateId = obj.templateId as TemplateId;
  }

  if (obj.seo !== undefined) {
    if (typeof obj.seo !== 'object' || obj.seo === null) {
      throw new LandingConfigInvalid('NOT_OBJECT', 'landing.seo', 'must be an object');
    }
    const seo = obj.seo as Record<string, unknown>;
    out.seo = {
      title: expectString(seo.title, 'landing.seo.title', TEXT_LIMITS.seoTitle),
      description: expectString(
        seo.description,
        'landing.seo.description',
        TEXT_LIMITS.seoDescription,
      ),
      ogImageUrl: expectHref(seo.ogImageUrl, 'landing.seo.ogImageUrl'),
    };
  }

  if (obj.hero !== undefined) {
    if (typeof obj.hero !== 'object' || obj.hero === null) {
      throw new LandingConfigInvalid('NOT_OBJECT', 'landing.hero', 'must be an object');
    }
    const hero = obj.hero as Record<string, unknown>;
    out.hero = {
      headline: expectString(hero.headline, 'landing.hero.headline', TEXT_LIMITS.headline),
      subhead: expectString(hero.subhead, 'landing.hero.subhead', TEXT_LIMITS.subhead),
      ctaLabel: expectString(hero.ctaLabel, 'landing.hero.ctaLabel', TEXT_LIMITS.cta),
      ctaHref: expectHref(hero.ctaHref, 'landing.hero.ctaHref'),
      imageUrl: expectHref(hero.imageUrl, 'landing.hero.imageUrl'),
    };
  }

  out.features = expectArray(obj.features, 'landing.features', MAX_FEATURES, (v, i) => {
    if (typeof v !== 'object' || v === null) {
      throw new LandingConfigInvalid('NOT_OBJECT', `landing.features[${i}]`, 'must be an object');
    }
    const f = v as Record<string, unknown>;
    const title = expectString(f.title, `landing.features[${i}].title`, TEXT_LIMITS.featureTitle);
    const body = expectString(f.body, `landing.features[${i}].body`, TEXT_LIMITS.featureBody);
    if (!title || !body) {
      throw new LandingConfigInvalid(
        'REQUIRED',
        `landing.features[${i}]`,
        'title and body are required',
      );
    }
    return {
      title,
      body,
      icon: expectString(f.icon, `landing.features[${i}].icon`, 40),
    };
  });

  out.testimonials = expectArray(
    obj.testimonials,
    'landing.testimonials',
    MAX_TESTIMONIALS,
    (v, i) => {
      if (typeof v !== 'object' || v === null) {
        throw new LandingConfigInvalid(
          'NOT_OBJECT',
          `landing.testimonials[${i}]`,
          'must be an object',
        );
      }
      const t = v as Record<string, unknown>;
      const quote = expectString(
        t.quote,
        `landing.testimonials[${i}].quote`,
        TEXT_LIMITS.testimonialQuote,
      );
      const author = expectString(
        t.author,
        `landing.testimonials[${i}].author`,
        TEXT_LIMITS.testimonialAuthor,
      );
      if (!quote || !author) {
        throw new LandingConfigInvalid(
          'REQUIRED',
          `landing.testimonials[${i}]`,
          'quote and author are required',
        );
      }
      return {
        quote,
        author,
        role: expectString(
          t.role,
          `landing.testimonials[${i}].role`,
          TEXT_LIMITS.testimonialRole,
        ),
        avatarUrl: expectHref(t.avatarUrl, `landing.testimonials[${i}].avatarUrl`),
      };
    },
  );

  if (obj.footer !== undefined) {
    if (typeof obj.footer !== 'object' || obj.footer === null) {
      throw new LandingConfigInvalid('NOT_OBJECT', 'landing.footer', 'must be an object');
    }
    const footer = obj.footer as Record<string, unknown>;
    const links = expectArray(footer.links, 'landing.footer.links', MAX_FOOTER_LINKS, (v, i) => {
      if (typeof v !== 'object' || v === null) {
        throw new LandingConfigInvalid(
          'NOT_OBJECT',
          `landing.footer.links[${i}]`,
          'must be an object',
        );
      }
      const l = v as Record<string, unknown>;
      const label = expectString(
        l.label,
        `landing.footer.links[${i}].label`,
        TEXT_LIMITS.footerLink,
      );
      const href = expectHref(l.href, `landing.footer.links[${i}].href`);
      if (!label || !href) {
        throw new LandingConfigInvalid(
          'REQUIRED',
          `landing.footer.links[${i}]`,
          'label and href are required',
        );
      }
      return { label, href };
    });
    out.footer = {
      legal: expectString(footer.legal, 'landing.footer.legal', TEXT_LIMITS.footerLegal),
      links,
    };
  }

  return out;
}

/**
 * Minimum-viable default used when an agency has no landing config yet.
 */
export function defaultLandingConfig(agencyName: string): AgencyLandingConfig {
  return {
    templateId: 'athleteClassic',
    hero: {
      headline: `${agencyName}`,
      subhead: 'Recruiting, delivered by your agency.',
      ctaLabel: 'Get started',
    },
  };
}
