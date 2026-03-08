import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { type Commit, filterCommits } from './commitsShared';
export type { Commit } from './commitsShared';

export type PersistedCommitsSnapshot = {
  updatedAt: string;
  footballScraped: boolean;
  basketballScraped: boolean;
  totalCommits: number;
  data: Commit[];
};

const FALLBACK_COMMITS: Commit[] = [
  {
    id: 'fb-top-1',
    sport: 'Football',
    list: 'top',
    rank: 1,
    name: 'Fallback QB',
    position: 'QB',
    university: 'Alabama',
    source: 'fallback',
  },
  {
    id: 'fb-recent-1',
    sport: 'Football',
    list: 'recent',
    name: 'Fallback QB',
    position: 'QB',
    university: 'Alabama',
    commitDate: '2026-01-01',
    source: 'fallback',
  },
  {
    id: 'bb-top-1',
    sport: 'Basketball',
    list: 'top',
    rank: 1,
    name: 'Fallback Guard',
    position: 'G',
    university: 'Duke',
    source: 'fallback',
  },
  {
    id: 'bb-recent-1',
    sport: 'Basketball',
    list: 'recent',
    name: 'Fallback Guard',
    position: 'G',
    university: 'Duke',
    commitDate: '2026-01-01',
    source: 'fallback',
  },
];

let COMMITS_STORE: Commit[] = [...FALLBACK_COMMITS];
let LAST_SNAPSHOT: PersistedCommitsSnapshot | null = null;

const COMMITS_BUCKET = process.env.COMMITS_CACHE_BUCKET || process.env.MEDIA_BUCKET || '';
const COMMITS_PREFIX = process.env.COMMITS_CACHE_PREFIX || 'commits-cache';
const s3Client = new S3Client({});

function buildRecentCommits(topMapped: Commit[]) {
  return topMapped.map((commit, index) => ({
    ...commit,
    id: `${commit.id}-recent`,
    list: 'recent' as const,
    rank: undefined,
    commitDate: new Date(Date.now() - index * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  }));
}

function mapFootball(top: any[]): Commit[] {
  const topMapped: Commit[] = top.slice(0, 50).map((commit) => ({
    id: commit.id,
    sport: 'Football',
    list: 'top',
    rank: commit.rank,
    name: commit.name,
    position: commit.position,
    university: commit.university,
    stars: 5,
    logo: commit.logo,
    classYear: commit.classYear,
    hometown: commit.hometown,
    highSchool: commit.highSchool,
    source: 'ESPN 300',
  }));

  return [...topMapped, ...buildRecentCommits(topMapped)];
}

function mapBasketball(top: any[]): Commit[] {
  const topMapped: Commit[] = top.slice(0, 50).map((commit) => ({
    id: commit.id,
    sport: 'Basketball',
    list: 'top',
    rank: commit.rank,
    name: commit.name,
    position: commit.position,
    university: commit.university,
    stars: 5,
    logo: commit.logo,
    classYear: commit.classYear,
    hometown: commit.hometown,
    highSchool: commit.highSchool,
    source: 'ESPN 300',
  }));

  return [...topMapped, ...buildRecentCommits(topMapped)];
}

export function listCommits(sport: Commit['sport'], list: Commit['list'], source: Commit[] = COMMITS_STORE) {
  const filtered = source.filter((commit) => commit.sport === sport && commit.list === list);
  if (list === 'recent') {
    return filtered.sort((a, b) => (b.commitDate || '').localeCompare(a.commitDate || '')).slice(0, 50);
  }
  return filtered.sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999)).slice(0, 50);
}

export { filterCommits };

export function upsertCommits(commits: Commit[]) {
  COMMITS_STORE = commits;
  return COMMITS_STORE;
}

export function footballScrapeStatus() {
  return { scraped: Boolean(LAST_SNAPSHOT?.footballScraped) };
}

export function basketballScrapeStatus() {
  return { scraped: Boolean(LAST_SNAPSHOT?.basketballScraped) };
}

export async function readPersistedCommitsSnapshot(): Promise<PersistedCommitsSnapshot | null> {
  if (!COMMITS_BUCKET) return null;

  try {
    const response = await s3Client.send(
      new GetObjectCommand({
        Bucket: COMMITS_BUCKET,
        Key: `${COMMITS_PREFIX}/latest.json`,
      }),
    );
    const body = await response.Body?.transformToString();
    if (!body) return null;
    const parsed = JSON.parse(body) as PersistedCommitsSnapshot;
    LAST_SNAPSHOT = parsed;
    COMMITS_STORE = parsed.data?.length ? parsed.data : COMMITS_STORE;
    return parsed;
  } catch {
    return null;
  }
}

export async function scrapeAndPersistCommits() {
  const { scrapeFootballTop, scrapeBasketballTop } = await import('./commitsScraper');

  const [footballTop, basketballTop] = await Promise.all([scrapeFootballTop(), scrapeBasketballTop()]);
  const footballCommits = footballTop.length ? mapFootball(footballTop) : [];
  const basketballCommits = basketballTop.length ? mapBasketball(basketballTop) : [];
  const data = [...footballCommits, ...basketballCommits];

  const snapshot: PersistedCommitsSnapshot = {
    updatedAt: new Date().toISOString(),
    footballScraped: footballTop.length > 0,
    basketballScraped: basketballTop.length > 0,
    totalCommits: data.length,
    data,
  };

  if (!COMMITS_BUCKET) {
    throw new Error('COMMITS_CACHE_BUCKET or MEDIA_BUCKET is not configured');
  }

  await s3Client.send(
    new PutObjectCommand({
      Bucket: COMMITS_BUCKET,
      Key: `${COMMITS_PREFIX}/latest.json`,
      Body: JSON.stringify(snapshot),
      ContentType: 'application/json',
      CacheControl: 'no-store',
    }),
  );

  LAST_SNAPSHOT = snapshot;
  COMMITS_STORE = snapshot.data;
  return snapshot;
}
