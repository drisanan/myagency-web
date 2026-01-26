import { withSentry } from '../lib/sentry';
import { extractCoachRows, normalizeName, selectLandingPage } from '../lib/coachVerifier';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';

const BASE_URL = 'https://c3gognktxzx6xqlrdfb6bxvxsu0ojalg.lambda-url.us-west-2.on.aws';

const DIVISION_API_MAPPING: Record<string, string> = {
  D1: 'division-1',
  D1AA: 'division-1aa',
  D2: 'division-2',
  D3: 'division-3',
  JUCO: 'division-juco',
  NAIA: 'division-naia',
};

const DEFAULT_DIVISIONS = ['D1', 'D1AA', 'D2', 'D3', 'JUCO', 'NAIA'];
const DEFAULT_SPORTS = [
  'Football',
  'Baseball',
  'Softball',
  'WomensSoccer',
  'MensSoccer',
  'MensBasketball',
  'WomensBasketball',
  'WomensTrack',
  'WomensVolleyball',
  'WomensSwimming',
  'MensTrack',
  'MensSwimming',
  'WomensTennis',
  'MensTennis',
  'Dance',
  'MensGymnastics',
  'WomensGymnastics',
  'MensIceHockey',
  'WomensIceHockey',
  'Cheerleading',
  'WomensFlagFootball',
  'MensGolf',
  'WomensGolf',
  'MensVolleyball',
  'MensLacrosse',
  'WomensLacrosse',
  'WomensCrossCountry',
  'MensCrossCountry',
];

const DEFAULT_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD','MA','MI','MN','MS',
  'MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC','SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
];

const s3Client = new S3Client({});
const S3_BUCKET = process.env.COACH_VERIFIER_S3_BUCKET || process.env.MEDIA_BUCKET || '';
const S3_PREFIX = process.env.COACH_VERIFIER_S3_PREFIX || 'coach-verifier';

type UniversityListItem = { name: string };
type Coach = { firstName: string; lastName: string; title?: string; email?: string };
type UniversityDetails = {
  name: string;
  coaches: Coach[];
  schoolInfo?: Record<string, any>;
};

const COACH_URL_SUFFIXES = [
  '/coaches',
  '/staff',
  '/roster/coaches',
  '/roster#coaches',
  '/staff-directory',
  '/directory',
];

function parseCsv(value?: string): string[] | null {
  if (!value) return null;
  return value.split(',').map((v) => v.trim()).filter(Boolean);
}

type LogRecord = { type: string; timestamp: string; payload: Record<string, unknown> };
type LogBuffer = { runId: string; bucket: string; prefix: string; buffer: LogRecord[]; part: number; enabled: boolean };

function createLogBuffer(): LogBuffer {
  const runId = new Date().toISOString().replace(/[:.]/g, '-');
  const bucket = S3_BUCKET;
  const prefix = S3_PREFIX;
  return {
    runId,
    bucket,
    prefix,
    buffer: [],
    part: 0,
    enabled: Boolean(bucket),
  };
}

async function flushLogs(logs: LogBuffer) {
  if (!logs.enabled || logs.buffer.length === 0) return;
  const body = logs.buffer.map((r) => JSON.stringify(r)).join('\n') + '\n';
  const key = `${logs.prefix}/${logs.runId}/part-${String(logs.part).padStart(4, '0')}.jsonl`;
  logs.part += 1;
  logs.buffer = [];
  await s3Client.send(
    new PutObjectCommand({
      Bucket: logs.bucket,
      Key: key,
      Body: body,
      ContentType: 'application/json',
    }),
  );
}

async function logRecord(logs: LogBuffer, type: string, payload: Record<string, unknown>) {
  const record = {
    type,
    timestamp: new Date().toISOString(),
    payload,
  };
  // Read-only logging: CloudWatch only
  // eslint-disable-next-line no-console
  console.log(JSON.stringify(record));
  if (logs.enabled) {
    logs.buffer.push(record);
    if (logs.buffer.length >= 200) {
      await flushLogs(logs);
    }
  }
}

async function fetchWithTimeout(url: string, timeoutMs: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { signal: controller.signal, redirect: 'follow' });
    return res;
  } finally {
    clearTimeout(timer);
  }
}

async function listUniversities(params: { sport: string; division: string; state: string }): Promise<UniversityListItem[]> {
  const qs = new URLSearchParams({ sport: params.sport, division: params.division, state: params.state });
  const url = `${BASE_URL}?${qs.toString()}`;
  const res = await fetchWithTimeout(url, 15000);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`listUniversities failed ${res.status}: ${text || res.statusText}`);
  }
  const data = await res.json();
  return (Array.isArray(data) ? data : []).map((u: any) => ({ name: u?.name ?? u?.School ?? u?.school ?? '' })).filter((u) => u.name);
}

async function getUniversityDetails(params: { sport: string; division: string; state: string; school: string }): Promise<UniversityDetails> {
  const qs = new URLSearchParams({ sport: params.sport, division: params.division, state: params.state, school: params.school });
  const url = `${BASE_URL}?${qs.toString()}`;
  const res = await fetchWithTimeout(url, 20000);
  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`getUniversityDetails failed ${res.status}: ${text || res.statusText}`);
  }
  const raw = await res.json();
  const obj = Array.isArray(raw) ? (raw[0] ?? {}) : raw;
  const coachesRaw = obj.coaches ?? obj.Coaches ?? [];
  const coaches = (Array.isArray(coachesRaw) ? coachesRaw : []).map((c: any) => ({
    firstName: c.firstName ?? c.FirstName ?? '',
    lastName: c.lastName ?? c.LastName ?? '',
    title: c.title ?? c.Title ?? c.Position ?? '',
    email: c.email ?? c.Email ?? '',
  }));
  return {
    name: obj.name ?? obj.Name ?? obj.school ?? obj.School ?? params.school,
    coaches,
    schoolInfo: obj.schoolInfo ?? obj,
  };
}

function scoreCoachLink(href: string, text: string) {
  const hay = `${href} ${text}`.toLowerCase();
  let score = 0;
  if (hay.includes('coaches')) score += 3;
  if (hay.includes('staff')) score += 2;
  if (hay.includes('directory')) score += 1;
  return score;
}

function toAbsoluteUrl(base: string, href: string) {
  if (href.startsWith('http')) return href;
  return new URL(href, base).toString();
}

async function discoverCoachPage(landingPage: string, meta: Record<string, unknown>, logs: LogBuffer) {
  const normalized = landingPage.replace(/\/$/, '');
  if (normalized.endsWith('/coaches')) return normalized;

  for (const suffix of COACH_URL_SUFFIXES) {
    const candidate = `${normalized}${suffix}`;
    const res = await fetchWithTimeout(candidate, 15000);
    if (res.status === 404) {
      await logRecord(logs, 'coach_url_404', { ...meta, attemptedUrl: candidate, source: 'suffix' });
      continue;
    }
    if (res.ok) return candidate;
  }

  const res = await fetchWithTimeout(landingPage, 15000);
  if (res.status === 404) {
    await logRecord(logs, 'coach_url_404', { ...meta, attemptedUrl: landingPage, source: 'landing' });
    return null;
  }
  if (!res.ok) return null;

  const html = await res.text();
  const anchorMatches = html.match(/<a[^>]+href=["'][^"']+["'][^>]*>[\s\S]*?<\/a>/gi) || [];
  let best: { href: string; score: number } | null = null;

  for (const anchor of anchorMatches) {
    const hrefMatch = anchor.match(/href=["']([^"']+)["']/i);
    const textMatch = anchor.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    if (!hrefMatch) continue;
    const href = toAbsoluteUrl(landingPage, hrefMatch[1]);
    const score = scoreCoachLink(href, textMatch);
    if (!best || score > best.score) {
      best = { href, score };
    }
  }

  return best?.href || null;
}

function matchCoach(scrapedNames: string[], coach: Coach) {
  const target = normalizeName(`${coach.firstName} ${coach.lastName}`);
  if (!target) return false;
  return scrapedNames.some((name) => normalizeName(name).includes(target));
}

async function verifyUniversity(params: {
  sport: string;
  division: string;
  state: string;
  school: string;
  delayMs: number;
  logs: LogBuffer;
}) {
  const { logs, ...meta } = params;
  const details = await getUniversityDetails(meta);
  const landingPage = selectLandingPage(details.schoolInfo);

  if (!landingPage) {
    await logRecord(logs, 'missing_landing_page', { ...meta, school: details.name });
    return;
  }

  const coachPage = await discoverCoachPage(landingPage, { ...meta, school: details.name }, logs);
  if (!coachPage) return;

  const coachPageRes = await fetchWithTimeout(coachPage, 20000);
  if (coachPageRes.status === 404) {
    await logRecord(logs, 'coach_url_404', { ...meta, school: details.name, attemptedUrl: coachPage, source: 'coach' });
    return;
  }
  if (!coachPageRes.ok) {
    await logRecord(logs, 'coach_page_error', { ...meta, school: details.name, attemptedUrl: coachPage, status: coachPageRes.status });
    return;
  }

  const html = await coachPageRes.text();
  const scraped = extractCoachRows(html);
  const scrapedNames = scraped.map((c) => c.name);

  const missing = details.coaches.filter((c) => !matchCoach(scrapedNames, c));
  const present = details.coaches.filter((c) => matchCoach(scrapedNames, c));
  const newCoaches = scraped.filter((s) => {
    const n = normalizeName(s.name);
    return !details.coaches.some((c) => normalizeName(`${c.firstName} ${c.lastName}`) === n);
  });

  await logRecord(logs, 'coach_verification_summary', {
    ...meta,
    school: details.name,
    landingPage,
    coachPage,
    totalScraped: scraped.length,
    totalKnown: details.coaches.length,
    missingCount: missing.length,
    presentCount: present.length,
    newCoachCount: newCoaches.length,
  });

  for (const c of missing) {
    await logRecord(logs, 'coach_missing', { ...meta, school: details.name, coach: c });
  }
  for (const c of newCoaches) {
    await logRecord(logs, 'coach_new', { ...meta, school: details.name, coach: c });
  }

  if (params.delayMs > 0) {
    await new Promise((res) => setTimeout(res, params.delayMs));
  }
}

async function runVerifier() {
  const sports = parseCsv(process.env.COACH_VERIFIER_SPORTS) || DEFAULT_SPORTS;
  const divisions = parseCsv(process.env.COACH_VERIFIER_DIVISIONS) || DEFAULT_DIVISIONS;
  const states = parseCsv(process.env.COACH_VERIFIER_STATES) || DEFAULT_STATES;
  const delayMs = Number(process.env.COACH_VERIFIER_DELAY_MS || 150);
  const maxUniversities = Number(process.env.COACH_VERIFIER_MAX_UNIVERSITIES || 200);
  const logs = createLogBuffer();

  let processed = 0;
  for (const sport of sports) {
    for (const divisionLabel of divisions) {
      for (const state of states) {
        const division = DIVISION_API_MAPPING[divisionLabel] || divisionLabel;
        let universities: UniversityListItem[] = [];
        try {
          universities = await listUniversities({ sport, division, state });
        } catch (err: any) {
          await logRecord(logs, 'universities_fetch_error', { sport, division: divisionLabel, state, error: err?.message || String(err) });
          continue;
        }

        for (const uni of universities) {
          if (!uni?.name) continue;
          await verifyUniversity({ sport, division, state, school: uni.name, delayMs, logs });
          processed += 1;
          if (processed >= maxUniversities) {
            await logRecord(logs, 'verifier_limit_reached', { processed, maxUniversities });
            await flushLogs(logs);
            return;
          }
        }
      }
    }
  }

  await flushLogs(logs);
}

export const handler = withSentry(async () => {
  await runVerifier();
  return { ok: true };
});

