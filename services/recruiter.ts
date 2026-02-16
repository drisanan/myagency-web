'use client';
// Real Lambda-backed recruiter service for universities list and details
const BASE_URL = 'https://1nkgfsilye.execute-api.us-west-1.amazonaws.com/universities';

// In-memory cache for university listings (5 minute TTL)
const CACHE_TTL = 5 * 60 * 1000;
const universityCache = new Map<string, { data: Array<{ name: string; logo?: string }>; expiresAt: number }>();

export const DIVISION_API_MAPPING: Record<string, string> = {
  D1: 'division-1',
  D1AA: 'division-1aa',
  D2: 'division-2',
  D3: 'division-3',
  JUCO: 'division-juco',
  NAIA: 'division-naia',
};

const DIVISION_SLUG_TO_LABEL: Record<string, string> = {
  'division-1': 'D1',
  'division-1aa': 'D1AA',
  'division-2': 'D2',
  'division-3': 'D3',
  'division-juco': 'JUCO',
  'division-naia': 'NAIA',
};

function toName(item: any): string {
  return item?.name ?? item?.School ?? item?.school ?? '';
}

function toLogo(item: any): string | undefined {
  const candidates = [
    item?.LogoURL,
    item?.logo,
    item?.Logo,
    item?.logoUrl,
    item?.logoURL,
    item?.LogoUrl,
    item?.logoDataUrl,
    item?.schoolLogo,
    item?.schoolLogoUrl,
    item?.image,
    item?.imageUrl,
  ];
  return candidates.find((value) => typeof value === 'string' && value.trim());
}

export async function listUniversities(params: { sport: string; division: string; state: string }): Promise<Array<{ name: string; logo?: string }>> {
  const cacheKey = `${params.sport}|${params.division}|${params.state}`;
  const cached = universityCache.get(cacheKey);
  if (cached && cached.expiresAt > Date.now()) {
    return cached.data;
  }

  const qs = new URLSearchParams({
    sport: params.sport,
    division: params.division,
    state: params.state,
  });
  const url = `${BASE_URL}?${qs.toString()}`;
  // eslint-disable-next-line no-console
  console.log('[Recruiter:listUniversities] GET', url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.error('[Recruiter:listUniversities] HTTP error', res.status, text);
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const data = await res.json();
  const result = (Array.isArray(data) ? data : [])
    .map((u: any) => ({ name: toName(u), logo: toLogo(u) }))
    .filter((u: any) => u.name);

  universityCache.set(cacheKey, { data: result, expiresAt: Date.now() + CACHE_TTL });
  return result;
}

export type Coach = {
  id: string;
  firstName: string;
  lastName: string;
  title: string;
  email?: string;
  twitter?: string;
  instagram?: string;
};

export type University = {
  id?: string;
  name: string;
  city: string;
  state: string;
  division: string;
  conference?: string;
  privatePublic?: string;
  coaches: Coach[];
  // raw school info payload from Lambda for richer rendering
  schoolInfo?: Record<string, any>;
};

export async function getUniversityDetails(params: { sport: string; division: string; state: string; school: string }): Promise<University> {
  const qs = new URLSearchParams({
    sport: params.sport,
    division: params.division,
    state: params.state,
    school: params.school,
  });
  const url = `${BASE_URL}?${qs.toString()}`;
  // eslint-disable-next-line no-console
  console.log('[Recruiter:getUniversityDetails] GET', url);
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    // eslint-disable-next-line no-console
    console.error('[Recruiter:getUniversityDetails] HTTP error', res.status, text);
    throw new Error(`HTTP ${res.status}: ${text || res.statusText}`);
  }
  const raw = await res.json();
  const obj = Array.isArray(raw) ? (raw[0] ?? {}) : raw;

  const coachesRaw = obj.coaches ?? obj.Coaches ?? [];
  const coaches = (Array.isArray(coachesRaw) ? coachesRaw : []).map((c: any, i: number) => {
    const firstName = c.firstName ?? c.FirstName ?? '';
    const lastName = c.lastName ?? c.LastName ?? '';
    const title = c.title ?? c.Title ?? c.Position ?? '';
    const email = c.email ?? c.Email ?? '';
    const baseId = String(c.id ?? c.Id ?? email ?? '').trim();
    const synthetic = [firstName, lastName, title, email].filter(Boolean).join('|');
    const id = (baseId ? `${baseId}|` : '') + `${synthetic}|${i}`;
    return {
      id,
      firstName,
      lastName,
      title,
      email: email || undefined,
      twitter: c.twitter ?? c.Twitter,
      instagram: c.instagram ?? c.Instagram,
    };
  });

  const cityCandidate = (() => {
    const direct =
      obj.city ?? obj.City ?? obj.cityName ?? obj.CityName;
    if (direct) return direct as string;
    if (typeof obj.Location === 'string' && obj.Location.includes(',')) {
      return obj.Location.split(',')[0].trim();
    }
    return '';
  })();

  const divisionRaw =
    obj.division ?? obj.Division ?? obj.divisionName ?? obj.DivisionName ?? obj.NcaaDivision ?? obj.NCAADivision ?? '';
  const divisionResolved =
    divisionRaw ||
    DIVISION_SLUG_TO_LABEL[(params.division || '').toLowerCase()] ||
    params.division;

  return {
    id: obj.id ?? obj.Id,
    name: obj.name ?? obj.Name ?? obj.school ?? obj.School ?? params.school,
    city: cityCandidate,
    state: obj.state ?? obj.State ?? params.state,
    division: divisionResolved,
    conference: obj.conference ?? obj.Conference,
    privatePublic: obj.privatePublic ?? obj.PrivatePublic,
    coaches,
    schoolInfo: obj.schoolInfo ?? obj,
  };
}


