import { AccountStatus, ClientRecord, ProgramLevel } from './models';
import { normalizePhoneDigits } from './phone';

export const MAX_CLIENT_GALLERY_IMAGES = 10;
export const MAX_CLIENT_HIGHLIGHT_VIDEOS = 4;

type HighlightVideoInput = {
  url?: unknown;
  title?: unknown;
};

export type HighlightVideoRecord = {
  url: string;
  title?: string;
};

export type NormalizedClientPayload = {
  email: string;
  firstName: string;
  lastName: string;
  sport: string;
  phone?: string;
  username?: string;
  division?: string;
  photoUrl?: string;
  profileImageUrl?: string;
  galleryImages: string[];
  highlightVideos: HighlightVideoRecord[];
  radar: Record<string, unknown>;
  programLevel?: ProgramLevel;
  accountStatus?: AccountStatus;
};

export class ClientPayloadError extends Error {
  fieldErrors: Record<string, string>;

  constructor(message: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.name = 'ClientPayloadError';
    this.fieldErrors = fieldErrors;
  }
}

function normalizeString(value: unknown, maxLength = 5000) {
  if (typeof value !== 'string') return undefined;
  const normalized = value.trim();
  if (!normalized) return undefined;
  return normalized.slice(0, maxLength);
}

function normalizeEmail(value: unknown) {
  const email = normalizeString(value, 320);
  return email ? email.toLowerCase() : undefined;
}

function normalizeUsername(value: unknown) {
  const username = normalizeString(value, 80);
  return username ? username.toLowerCase().replace(/[^a-z0-9-]/g, '') || undefined : undefined;
}

function normalizeUrl(value: unknown) {
  return normalizeString(value, 4000);
}

function normalizeStringArray(value: unknown, maxItems: number) {
  if (!Array.isArray(value)) return [];
  const normalized = value
    .map((item) => normalizeUrl(item))
    .filter((item): item is string => Boolean(item));
  return normalized.slice(0, maxItems);
}

function normalizeHighlightVideos(value: unknown) {
  if (!Array.isArray(value)) return [];
  const normalized: HighlightVideoRecord[] = [];
  for (const item of value as HighlightVideoInput[]) {
    const url = normalizeUrl(item?.url);
    if (!url) continue;
    normalized.push({
      url,
      ...(normalizeString(item?.title, 200) ? { title: normalizeString(item?.title, 200) } : {}),
    });
    if (normalized.length >= MAX_CLIENT_HIGHLIGHT_VIDEOS) break;
  }
  return normalized;
}

function normalizeUnknown(value: unknown): unknown {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string') return normalizeString(value);
  if (typeof value === 'number') return Number.isFinite(value) ? value : undefined;
  if (typeof value === 'boolean') return value;
  if (Array.isArray(value)) {
    const normalized = value
      .map((entry) => normalizeUnknown(entry))
      .filter((entry) => entry !== undefined);
    return normalized;
  }
  if (typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .map(([key, entryValue]) => [key, normalizeUnknown(entryValue)] as const)
      .filter(([, entryValue]) => entryValue !== undefined);
    return Object.fromEntries(entries);
  }
  return undefined;
}

function normalizeRadar(value: unknown) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const normalized = normalizeUnknown(value);
  return normalized && typeof normalized === 'object' && !Array.isArray(normalized)
    ? (normalized as Record<string, unknown>)
    : {};
}

export function normalizeClientPayload(
  payload: Record<string, unknown>,
  options?: {
    existing?: Partial<ClientRecord>;
    requireRequiredFields?: boolean;
    defaultAccountStatus?: AccountStatus;
  },
): NormalizedClientPayload {
  const existing = options?.existing || {};
  const fieldErrors: Record<string, string> = {};
  const has = (key: string) => Object.prototype.hasOwnProperty.call(payload, key);

  const email = has('email') ? normalizeEmail(payload.email) : normalizeEmail(existing.email);
  const firstName = has('firstName') ? normalizeString(payload.firstName, 120) : normalizeString(existing.firstName, 120);
  const lastName = has('lastName') ? normalizeString(payload.lastName, 120) : normalizeString(existing.lastName, 120);
  const sport = has('sport') ? normalizeString(payload.sport, 120) : normalizeString(existing.sport, 120);
  const rawPhone = has('phone') ? normalizeString(payload.phone, 32) : normalizeString(existing.phone, 32);
  const phone = rawPhone ? normalizePhoneDigits(rawPhone) || rawPhone : rawPhone;
  const username = has('username') ? normalizeUsername(payload.username) : normalizeUsername(existing.username);
  const division = has('division')
    ? normalizeString(payload.division, 120)
    : normalizeString((existing as Record<string, unknown>).division, 120);
  const galleryImages =
    has('galleryImages')
      ? normalizeStringArray(payload.galleryImages, MAX_CLIENT_GALLERY_IMAGES)
      : normalizeStringArray(existing.galleryImages, MAX_CLIENT_GALLERY_IMAGES);
  const highlightVideos =
    has('highlightVideos')
      ? normalizeHighlightVideos(payload.highlightVideos)
      : normalizeHighlightVideos((existing as Record<string, unknown>).highlightVideos);

  const rawPhotoUrl = has('photoUrl') || has('profileImageUrl') || has('radar')
    ? normalizeUrl(payload.photoUrl)
      ?? normalizeUrl(payload.profileImageUrl)
      ?? normalizeUrl((payload.radar as Record<string, unknown> | undefined)?.profileImage)
      ?? normalizeUrl((payload.radar as Record<string, unknown> | undefined)?.profileImageUrl)
      ?? normalizeUrl((payload.radar as Record<string, unknown> | undefined)?.photoUrl)
    : normalizeUrl((existing as Record<string, unknown>).photoUrl)
      ?? normalizeUrl((existing as Record<string, unknown>).profileImageUrl);
  const photoUrl = rawPhotoUrl;
  const profileImageUrl = rawPhotoUrl;

  const radar = {
    ...normalizeRadar(existing.radar),
    ...normalizeRadar(payload.radar),
  };

  if (photoUrl) {
    radar.profileImage = photoUrl;
    radar.profileImageUrl = photoUrl;
    radar.photoUrl = photoUrl;
  }

  if (options?.requireRequiredFields) {
    if (!email) fieldErrors.email = 'Email is required';
    if (!firstName) fieldErrors.firstName = 'First name is required';
    if (!lastName) fieldErrors.lastName = 'Last name is required';
    if (!sport) fieldErrors.sport = 'Sport is required';
  }

  if (galleryImages.length > MAX_CLIENT_GALLERY_IMAGES) {
    fieldErrors.galleryImages = `Maximum ${MAX_CLIENT_GALLERY_IMAGES} gallery images allowed`;
  }

  if (highlightVideos.length > MAX_CLIENT_HIGHLIGHT_VIDEOS) {
    fieldErrors.highlightVideos = `Maximum ${MAX_CLIENT_HIGHLIGHT_VIDEOS} highlight videos allowed`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    throw new ClientPayloadError('Please correct the highlighted client fields.', fieldErrors);
  }

  return {
    email: email || '',
    firstName: firstName || '',
    lastName: lastName || '',
    sport: sport || '',
    ...(phone ? { phone } : {}),
    ...(username ? { username } : {}),
    ...(division ? { division } : {}),
    ...(photoUrl ? { photoUrl } : {}),
    ...(profileImageUrl ? { profileImageUrl } : {}),
    galleryImages,
    highlightVideos,
    radar,
    ...((payload.programLevel as ProgramLevel | undefined) || existing.programLevel
      ? { programLevel: (payload.programLevel as ProgramLevel | undefined) || existing.programLevel }
      : {}),
    ...((payload.accountStatus as AccountStatus | undefined) || options?.defaultAccountStatus || existing.accountStatus
      ? {
          accountStatus:
            (payload.accountStatus as AccountStatus | undefined)
            || options?.defaultAccountStatus
            || existing.accountStatus,
        }
      : {}),
  };
}
