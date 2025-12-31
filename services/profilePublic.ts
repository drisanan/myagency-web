/**
 * Public Profile Service
 * Handles fetching public athlete profiles by username (vanity URL)
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '';

export type PublicProfile = {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
  sport: string;
  phone?: string;
  email?: string;
  galleryImages: string[];
  radar: {
    // Personal info
    preferredPosition?: string;
    athleteheight?: string;
    athleteWeight?: string;
    school?: string;
    act?: string;
    sat?: string;
    graduationYear?: string;
    gpa?: string;
    description?: string;
    // Social
    instagramProfileUrl?: string;
    tiktokProfileUrl?: string;
    twitterUrl?: string;
    facebookUrl?: string;
    // Content
    youtubeHighlightUrl?: string;
    spotifySong?: string;
    hudlLink?: string;
    jungoLink?: string;
    additionalStatsLink?: string;
    // Events & Metrics
    events?: Array<{ name: string; startTime?: string }>;
    metrics?: Array<{ title: string; value: string }>;
    // Motivation
    myMotivator?: string;
    athleteAdvice?: string;
    differenceMaker?: string;
    references?: Array<{ name: string; email?: string; phone?: string }>;
    // Profile image
    profileImage?: string;
  };
};

/**
 * Fetch public athlete profile by username
 */
export async function getPublicProfile(username: string): Promise<PublicProfile | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/athlete/${encodeURIComponent(username)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    if (!res.ok) {
      if (res.status === 404) return null;
      throw new Error(`Failed to fetch profile: ${res.status}`);
    }
    
    const data = await res.json();
    return data?.profile ?? null;
  } catch (e) {
    console.error('[profilePublic] getPublicProfile error:', e);
    return null;
  }
}

/**
 * Check if a username is available
 */
export async function checkUsernameAvailability(username: string): Promise<{ available: boolean; reason?: string }> {
  try {
    const cleanUsername = username.toLowerCase().replace(/[^a-z0-9-]/g, '');
    
    if (cleanUsername.length < 3) {
      return { available: false, reason: 'too_short' };
    }
    
    const res = await fetch(`${API_BASE_URL}/athlete/check-username?username=${encodeURIComponent(cleanUsername)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    
    const data = await res.json();
    return { available: data?.available ?? false, reason: data?.reason };
  } catch (e) {
    console.error('[profilePublic] checkUsernameAvailability error:', e);
    return { available: false, reason: 'error' };
  }
}

