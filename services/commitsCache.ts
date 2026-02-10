import { listCommitsServer, isScrapingComplete, type Commit } from './commits';

const FIVE_MIN_MS = 5 * 60 * 1000;

type CacheKey = `${Commit['sport']}-${Commit['list']}`;

type CacheEntry = {
  data: Commit[];
  ts: number;
};

const cache = new Map<CacheKey, CacheEntry>();

export async function getCachedCommits(
  sport: Commit['sport'],
  list: Commit['list'],
  ttlMs = FIVE_MIN_MS,
) {
  const key: CacheKey = `${sport}-${list}`;
  const now = Date.now();
  const hit = cache.get(key);

  // Only use cache if scrapers have completed AND cache entry is still valid
  if (hit && now - hit.ts < ttlMs && isScrapingComplete(sport)) {
    return hit.data;
  }

  // Return live data only — empty array if scraping hasn't completed
  const data = listCommitsServer(sport, list);

  // Only cache if scrapers have finished
  if (isScrapingComplete(sport) && data.length > 0) {
    cache.set(key, { data, ts: now });
  }

  return data;
}

export function clearCommitsCache() {
  cache.clear();
}

export async function rehydrateCommitsCache() {
  cache.clear();
  const sports: Commit['sport'][] = ['Football', 'Basketball'];
  const lists: Commit['list'][] = ['recent', 'top'];
  await Promise.all(
    sports.flatMap((sport) => lists.map((list) => getCachedCommits(sport, list, 0))),
  );
}
