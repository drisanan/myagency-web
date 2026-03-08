import { listCommits, readPersistedCommitsSnapshot, scrapeAndPersistCommits, type Commit, type PersistedCommitsSnapshot } from './commits';

const FIVE_MIN_MS = 5 * 60 * 1000;

type CacheEntry = {
  snapshot: PersistedCommitsSnapshot | null;
  ts: number;
};

let cache: CacheEntry | null = null;

export async function getCachedCommits(
  sport: Commit['sport'],
  list: Commit['list'],
  ttlMs = FIVE_MIN_MS,
) {
  const now = Date.now();
  if (cache && now - cache.ts < ttlMs) {
    return listCommits(sport, list, cache.snapshot?.data || []);
  }

  const snapshot = await readPersistedCommitsSnapshot();
  cache = { snapshot, ts: now };
  return listCommits(sport, list, snapshot?.data || []);
}

export function clearCommitsCache() {
  cache = null;
}

export async function rehydrateCommitsCache() {
  clearCommitsCache();
  const snapshot = await scrapeAndPersistCommits();
  cache = { snapshot, ts: Date.now() };
  return snapshot;
}
