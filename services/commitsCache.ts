import { listCommitsServer, type Commit } from './commits';

const ONE_DAY_MS = 24 * 60 * 60 * 1000;

type CacheKey = `${Commit['sport']}-${Commit['list']}`;

type CacheEntry = {
  data: Commit[];
  ts: number;
};

const cache = new Map<CacheKey, CacheEntry>();

export async function getCachedCommits(
  sport: Commit['sport'],
  list: Commit['list'],
  ttlMs = ONE_DAY_MS,
) {
  const key: CacheKey = `${sport}-${list}`;
  const now = Date.now();
  const hit = cache.get(key);
  if (hit && now - hit.ts < ttlMs) {
    return hit.data;
  }
  const data = listCommitsServer(sport, list);
  cache.set(key, { data, ts: now });
  return data;
}

export function clearCommitsCache() {
  cache.clear();
}


