/**
 * Email Tracking Service
 * 
 * Provides utilities for tracking email engagement:
 * - Wrapping links with tracking URLs
 * - Recording email sends
 * - Fetching email metrics
 */

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export type TrackingParams = {
  agencyId: string;
  clientId: string;
  athleteEmail: string;
  recipientEmail: string;
  university?: string;
  campaignId?: string;
};

export type EmailMetrics = {
  ok: boolean;
  clientId?: string;
  period?: string;
  stats?: {
    sentCount: number;
    clickCount: number;
    uniqueRecipients?: number;
    uniqueClickers?: number;
  };
  totals?: {
    sentCount: number;
    clickCount: number;
    uniqueRecipients?: number;
    uniqueClickers?: number;
  };
  byClient?: Record<string, { sent: number; clicks: number }>;
  recentSends?: Array<{
    recipientEmail: string;
    recipientName?: string;
    university?: string;
    sentAt: number;
  }>;
  recentClicks?: Array<{
    recipientEmail: string;
    destination: string;
    linkType?: string;
    clickedAt: number;
  }>;
};

/**
 * Generate a tracking URL for a destination link
 * 
 * Uses short parameter names to keep URLs compact:
 * - d = destination URL
 * - g = agency ID
 * - c = client ID
 * - a = athlete email
 * - r = recipient email
 * - u = university
 */
export function createTrackingUrl(destination: string, params: TrackingParams): string {
  // Use the API base for the redirect service
  const base = API_BASE || 'https://api.athletenarrative.com';
  const trackingUrl = new URL(`${base}/r`);
  
  // Use short param names to keep URL compact
  trackingUrl.searchParams.set('d', destination);
  trackingUrl.searchParams.set('g', params.agencyId);
  trackingUrl.searchParams.set('c', params.clientId);
  trackingUrl.searchParams.set('a', params.athleteEmail);
  trackingUrl.searchParams.set('r', params.recipientEmail);
  if (params.university) {
    trackingUrl.searchParams.set('u', params.university);
  }
  if (params.campaignId) {
    trackingUrl.searchParams.set('p', params.campaignId);
  }
  
  return trackingUrl.toString();
}

/**
 * Wrap all links in HTML content with tracking URLs
 * 
 * @param html - The HTML content to process
 * @param params - Tracking parameters to embed in links
 * @returns HTML with all http/https links wrapped
 */
export function wrapLinksWithTracking(html: string, params: TrackingParams): string {
  // Match href="http..." or href="https..."
  return html.replace(
    /href="(https?:\/\/[^"]+)"/gi,
    (match, url) => {
      // Skip mailto: and tel: links (though regex shouldn't match them)
      if (url.startsWith('mailto:') || url.startsWith('tel:')) {
        return match;
      }
      
      // Skip links that are already tracking links
      if (url.includes('/r?') || url.includes('/track/click')) {
        return match;
      }
      
      // Skip certain internal links that shouldn't be tracked
      if (url.includes('unsubscribe') || url.includes('preferences')) {
        return match;
      }
      
      const trackingUrl = createTrackingUrl(url, params);
      return `href="${trackingUrl}"`;
    }
  );
}

export function createOpenPixelUrl(params: TrackingParams): string {
  const base = API_BASE || 'https://api.athletenarrative.com';
  const url = new URL(`${base}/email-metrics/open`);
  url.searchParams.set('clientId', params.clientId);
  url.searchParams.set('clientEmail', params.athleteEmail);
  url.searchParams.set('recipientEmail', params.recipientEmail);
  if (params.university) url.searchParams.set('university', params.university);
  if (params.campaignId) url.searchParams.set('campaignId', params.campaignId);
  return url.toString();
}

/**
 * Record email sends to the backend
 * 
 * @param data - Information about the emails sent
 * @returns Promise with the result
 */
export async function recordEmailSends(data: {
  clientId: string;
  clientEmail: string;
  recipients: Array<{ email: string; name?: string; university?: string }>;
  subject?: string;
  draftId?: string;
  campaignId?: string;
}): Promise<{ ok: boolean; recorded?: number; error?: string }> {
  if (!API_BASE) {
    console.warn('[emailTracking] No API_BASE configured, skipping send recording');
    return { ok: false, error: 'API not configured' };
  }

  try {
    const res = await fetch(`${API_BASE}/email-metrics/send`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(data),
    });
    
    if (!res.ok) {
      const text = await res.text();
      console.error('[emailTracking] Record sends failed:', text);
      return { ok: false, error: text };
    }
    
    return await res.json();
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Network error';
    console.error('[emailTracking] Record sends error:', err);
    return { ok: false, error: message };
  }
}

/**
 * Fetch email metrics from the backend
 * 
 * @param params - Query parameters
 * @returns Promise with the metrics data
 */
export async function fetchEmailMetrics(params?: {
  clientId?: string;
  period?: string;
  days?: number;
}): Promise<EmailMetrics> {
  if (!API_BASE) {
    console.warn('[emailTracking] No API_BASE configured');
    return { ok: false };
  }

  const searchParams = new URLSearchParams();
  if (params?.clientId) searchParams.set('clientId', params.clientId);
  if (params?.period) searchParams.set('period', params.period);
  if (params?.days) searchParams.set('days', String(params.days));
  
  const res = await fetch(`${API_BASE}/email-metrics/stats?${searchParams}`, {
    credentials: 'include',
  });
  
  if (!res.ok) {
    throw new Error(`Failed to fetch metrics: ${res.status}`);
  }
  
  return res.json();
}

/**
 * Check if email tracking is enabled
 * 
 * @returns true if API_BASE is configured
 */
export function isTrackingEnabled(): boolean {
  return Boolean(API_BASE);
}
