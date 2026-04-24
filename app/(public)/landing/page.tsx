import React from 'react';
import { headers } from 'next/headers';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  resolveLandingByAgencyId,
  resolveLandingByHostname,
  type ResolvedLanding,
} from '@/services/landingResolver';
import {
  DEFAULT_TEMPLATE_ID,
  LANDING_TEMPLATES,
  type TemplateId,
} from '@/features/whitelabel/templates';

/**
 * Public landing route for white-label custom domains.
 *
 * The Edge middleware (`middleware.ts`) rewrites `/` on a non-canonical host to
 * `/landing?host=<host>`. This server component (Node runtime) resolves the
 * hostname against `DOMAIN#<hostname>` in DynamoDB and renders the agency's
 * configured template. Preview mode: `/landing?agencyId=<id>` (used by the
 * settings preview pane; guarded by the session layer in Phase 6).
 *
 * See docs/02-solutions-architect/whitelabel-audit.md §1, §4-§7.
 */

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type SearchParams = { host?: string; agencyId?: string };

async function resolve(
  searchParams: SearchParams,
): Promise<{ resolved: ResolvedLanding | null; signInHref: string }> {
  const headerList = await headers();
  const hostFromHeader = headerList.get('x-tenant-host') || '';
  const host = (searchParams.host || hostFromHeader || '').trim();
  const agencyId = (searchParams.agencyId || '').trim();

  const canonicalRoot =
    process.env.NEXT_PUBLIC_CANONICAL_HOST || 'https://app.myrecruiteragency.com';

  function buildSignInHref(targetHost: string | null): string {
    // On a resolved tenant / custom host, keep the whole auth flow on
    // the tenant's own domain. The /auth/login route is part of the
    // same Next.js bundle served on every host, and session cookies use
    // Domain=.myrecruiteragency.com (or the caller's zone) so the
    // session is usable anywhere after sign-in. Staying on-host is
    // required for the white-label UX to feel cohesive.
    if (targetHost) {
      return `https://${targetHost}/auth/login`;
    }
    // Preview mode (no real host) and unresolved fallbacks route to the
    // canonical app surface.
    return new URL('/auth/login', canonicalRoot).toString();
  }

  if (agencyId) {
    return {
      resolved: await resolveLandingByAgencyId(agencyId),
      signInHref: buildSignInHref(null),
    };
  }
  if (host) {
    return {
      resolved: await resolveLandingByHostname(host),
      signInHref: buildSignInHref(host),
    };
  }
  return { resolved: null, signInHref: buildSignInHref(null) };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const params = await searchParams;
  const { resolved } = await resolve(params);
  if (!resolved) return { title: 'Not found' };

  const seo = resolved.landing.seo || {};

  // Canonical URL strategy (see whitelabel-audit.md §8 SEO):
  //   - Live custom host (status = ACTIVE, not preview): canonical to
  //     https://<custom-host>/. This is the only surface we want Google to
  //     index, keeping link equity on the customer's own domain.
  //   - Preview (isPreview = true): canonical to the agency's live custom
  //     host if one exists, to avoid splitting equity. Otherwise noindex and
  //     canonical to the canonical app host's preview URL.
  const canonicalRoot =
    process.env.NEXT_PUBLIC_CANONICAL_HOST || 'https://app.myrecruiteragency.com';
  const liveHost = resolved.activeCustomHostname;
  const shouldIndex = !resolved.isPreview && resolved.domain.status === 'ACTIVE';

  let canonicalUrl: string;
  if (liveHost) {
    canonicalUrl = `https://${liveHost}/`;
  } else {
    canonicalUrl = `${canonicalRoot}/landing?agencyId=${encodeURIComponent(resolved.agency.id)}`;
  }

  return {
    title: seo.title || resolved.agency.name,
    description: seo.description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: seo.title || resolved.agency.name,
      description: seo.description,
      url: canonicalUrl,
      images: seo.ogImageUrl ? [{ url: seo.ogImageUrl }] : undefined,
    },
    robots: shouldIndex ? 'index,follow' : 'noindex,nofollow',
  };
}

export default async function LandingPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const { resolved, signInHref } = await resolve(params);

  if (!resolved) {
    notFound();
  }

  const templateId: TemplateId = resolved.landing.templateId || DEFAULT_TEMPLATE_ID;
  const Template = LANDING_TEMPLATES[templateId] || LANDING_TEMPLATES[DEFAULT_TEMPLATE_ID];

  return (
    <Template
      agencyName={resolved.agency.name}
      branding={resolved.agency.settings || {}}
      landing={resolved.landing}
      signInHref={signInHref}
    />
  );
}
