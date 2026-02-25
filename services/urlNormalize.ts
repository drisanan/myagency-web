/**
 * Normalize user-supplied URLs for highlight/social links.
 *
 * Users may enter a full URL, a URL without protocol, a relative path,
 * or just a bare identifier. This module resolves all variants into a
 * valid absolute URL for each supported platform.
 */

function strip(raw: string): string {
  return raw.trim().replace(/^@/, '');
}

function hasDomain(value: string, domains: string[]): boolean {
  const lower = value.toLowerCase();
  return domains.some((d) => lower.includes(d));
}

function ensureProtocol(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `https://${url}`;
}

// ---------------------------------------------------------------------------
// YouTube
// Accepts: full URL, youtu.be short, watch?v= URL, or bare video ID
// ---------------------------------------------------------------------------
const YT_DOMAINS = ['youtube.com', 'youtu.be'];

function extractYouTubeId(value: string): string | null {
  const withProto = ensureProtocol(value);
  try {
    const url = new URL(withProto);
    if (url.hostname.includes('youtu.be')) return url.pathname.replace(/^\//, '').split('/')[0] || null;
    const v = url.searchParams.get('v');
    if (v) return v;
    if (url.pathname.startsWith('/embed/') || url.pathname.startsWith('/v/') || url.pathname.startsWith('/shorts/')) {
      return url.pathname.split('/')[2] || null;
    }
  } catch { /* not a parseable URL */ }
  return null;
}

export function normalizeYouTubeUrl(raw: string): string {
  const value = strip(raw);
  if (!value) return '';
  if (hasDomain(value, YT_DOMAINS)) {
    const id = extractYouTubeId(value);
    if (id) return `https://www.youtube.com/watch?v=${id}`;
    return ensureProtocol(value);
  }
  if (/^[\w-]{8,15}$/.test(value)) return `https://www.youtube.com/watch?v=${value}`;
  if (value.startsWith('watch?v=')) return `https://www.youtube.com/${value}`;
  return ensureProtocol(value);
}

// ---------------------------------------------------------------------------
// Hudl
// Accepts: full URL, www-prefixed URL, domain-relative path, or bare slug
// ---------------------------------------------------------------------------
const HUDL_DOMAINS = ['hudl.com'];

export function normalizeHudlUrl(raw: string): string {
  const value = strip(raw);
  if (!value) return '';
  if (hasDomain(value, HUDL_DOMAINS)) return ensureProtocol(value);
  if (value.startsWith('profile/') || value.startsWith('video/')) return `https://www.hudl.com/${value}`;
  if (/^\d+/.test(value)) return `https://www.hudl.com/profile/${value}`;
  return `https://www.hudl.com/profile/${value}`;
}

// ---------------------------------------------------------------------------
// Instagram
// Accepts: full URL, @handle, or bare handle
// ---------------------------------------------------------------------------
const IG_DOMAINS = ['instagram.com'];

export function normalizeInstagramUrl(raw: string): string {
  const value = strip(raw);
  if (!value) return '';
  if (hasDomain(value, IG_DOMAINS)) return ensureProtocol(value);
  return `https://www.instagram.com/${value}`;
}

// ---------------------------------------------------------------------------
// Generic link (Jungo, additional stats, news articles, Spotify, etc.)
// Just ensures protocol is present; no domain-specific logic.
// ---------------------------------------------------------------------------
export function normalizeGenericUrl(raw: string): string {
  const value = raw.trim();
  if (!value) return '';
  return ensureProtocol(value);
}
