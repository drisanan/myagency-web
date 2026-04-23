import type { MetadataRoute } from 'next';
import { headers } from 'next/headers';

/**
 * Dynamic robots.txt for white-label hosts.
 *
 * Rules by host:
 *   - Canonical host (app.myrecruiteragency.com, etc.): block `/landing` so
 *     preview URLs don't compete with the live custom domain. App surfaces
 *     remain discoverable by default. Authenticated routes are effectively
 *     noindexed by the middleware redirect to /auth/login, so we don't need
 *     to duplicate that list here.
 *   - Custom / pilot host: allow everything and advertise the tenant sitemap.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
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
    return {
      rules: [
        {
          userAgent: '*',
          allow: '/',
          disallow: ['/landing', '/auth/handoff'],
        },
      ],
      sitemap: `https://${host}/sitemap.xml`,
    };
  }

  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: `https://${host}/sitemap.xml`,
  };
}
