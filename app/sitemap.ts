import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';
import { resolveLandingByHostname } from '@/services/landingResolver';

/**
 * Minimal per-tenant sitemap.
 *
 * - On a canonical host we publish only the marketing root. The white-label
 *   `/landing` previews are intentionally excluded (they canonicalize to the
 *   customer's custom host when one exists; see app/(public)/landing/page.tsx).
 * - On a custom / pilot host we resolve the agency from DOMAIN# and list the
 *   public routes that actually exist for a tenant (the landing page plus the
 *   public sign-in deep link).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host =
    h.get('x-tenant-host') ||
    h.get('x-forwarded-host') ||
    h.get('host') ||
    '';
  const isCanonical =
    host.endsWith('myrecruiteragency.com') ||
    host === 'localhost' ||
    host.startsWith('localhost:');

  if (isCanonical) {
    const base = `https://${host}`;
    return [
      { url: `${base}/`, changeFrequency: 'weekly', priority: 0.5 },
    ];
  }

  try {
    const resolved = await resolveLandingByHostname(host);
    if (!resolved) return [];
    const base = `https://${host}`;
    const lastModified = new Date(resolved.agency.createdAt || Date.now());
    return [
      { url: `${base}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    ];
  } catch {
    return [];
  }
}
