export type Commit = {
  id: string;
  sport: 'Football' | 'Basketball';
  list: 'recent' | 'top';
  rank?: number; // top only
  name: string;
  position?: string;
  stars?: number;
  university?: string;
  commitDate?: string; // ISO for recent
  source?: string;
  logo?: string;
  classYear?: string;
  hometown?: string;
  highSchool?: string;
};

// Live data only — no seed/placeholder data
let COMMITS: Commit[] = [];
let SCRAPED_FOOTBALL = false;
let SCRAPED_BASKETBALL = false;

export function listCommits(sport: Commit['sport'], list: Commit['list']) {
  const filtered = COMMITS.filter((c) => c.sport === sport && c.list === list);
  if (list === 'recent') {
    return filtered
      .sort((a, b) => (b.commitDate || '').localeCompare(a.commitDate || ''))
      .slice(0, 50);
  }
  return filtered
    .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
    .slice(0, 50);
}

export function filterCommits(commits: Commit[], filters: { position?: string; university?: string }) {
  return commits.filter((c) => {
    const posMatch = filters.position ? (c.position || '').toLowerCase().includes(filters.position.toLowerCase()) : true;
    const uniMatch = filters.university ? (c.university || '').toLowerCase().includes(filters.university.toLowerCase()) : true;
    return posMatch && uniMatch;
  });
}

export function upsertCommits(commits: Commit[]) {
  COMMITS = commits;
  return COMMITS;
}

export function footballScrapeStatus() {
  return { scraped: SCRAPED_FOOTBALL };
}

export function basketballScrapeStatus() {
  return { scraped: SCRAPED_BASKETBALL };
}

/**
 * Check if scraping has completed for a given sport.
 */
export function isScrapingComplete(sport: Commit['sport']): boolean {
  return sport === 'Football' ? SCRAPED_FOOTBALL : SCRAPED_BASKETBALL;
}

export function listCommitsServer(sport: Commit['sport'], list: Commit['list']) {
  const filtered = COMMITS.filter((c) => c.sport === sport && c.list === list);
  if (list === 'recent') {
    return filtered
      .sort((a, b) => (b.commitDate || '').localeCompare(a.commitDate || ''))
      .slice(0, 50);
  }
  return filtered
    .sort((a, b) => (a.rank ?? 9999) - (b.rank ?? 9999))
    .slice(0, 50);
}

// Load live football data from scraper (server-side only) at startup
async function loadFootballFromScrape() {
  if (typeof window !== 'undefined') return; // client skip
  try {
    const { scrapeFootballTop } = await import('./commitsScraper');
    const top = await scrapeFootballTop();
    if (top.length) {
      SCRAPED_FOOTBALL = true;
      const topMapped: Commit[] = top.slice(0, 50).map((c) => ({
        id: c.id,
        sport: 'Football',
        list: 'top',
        rank: c.rank,
        name: c.name,
        position: c.position,
        university: c.university,
        stars: 5,
        logo: c.logo,
        classYear: c.classYear,
        hometown: c.hometown,
        highSchool: c.highSchool,
        source: 'ESPN 300',
      }));
      const recent: Commit[] = topMapped.map((c, idx) => ({
        ...c,
        id: `${c.id}-recent`,
        list: 'recent',
        rank: undefined,
        commitDate: new Date(Date.now() - idx * 24 * 3600 * 1000).toISOString().slice(0, 10),
      }));
      // Merge: keep basketball from current store (may be scraped), replace football
      const existing = COMMITS.filter((c) => c.sport === 'Basketball');
      COMMITS = [...existing, ...topMapped, ...recent];

      // Clear cache so fresh data is served immediately
      try {
        const { clearCommitsCache } = await import('./commitsCache');
        clearCommitsCache();
        console.log('[commits] Football scrape complete, cache cleared');
      } catch { /* ignore if cache not available */ }
    } else {
      console.warn('[commits] Football scrape returned empty results — no data to display');
    }
  } catch (e) {
    console.error('[commits] Football scrape failed:', (e as Error)?.message);
  }
}

async function loadBasketballFromScrape() {
  if (typeof window !== 'undefined') return; // client skip
  try {
    const { scrapeBasketballTop } = await import('./commitsScraper');
    const top = await scrapeBasketballTop();
    if (top.length) {
      SCRAPED_BASKETBALL = true;
      const topMapped: Commit[] = top.slice(0, 50).map((c) => ({
        id: c.id,
        sport: 'Basketball',
        list: 'top',
        rank: c.rank,
        name: c.name,
        position: c.position,
        university: c.university,
        stars: 5,
        logo: c.logo,
        classYear: c.classYear,
        hometown: c.hometown,
        highSchool: c.highSchool,
        source: 'ESPN 300',
      }));
      const recent: Commit[] = topMapped.map((c, idx) => ({
        ...c,
        id: `${c.id}-recent`,
        list: 'recent',
        rank: undefined,
        commitDate: new Date(Date.now() - idx * 24 * 3600 * 1000).toISOString().slice(0, 10),
      }));
      // Merge: keep football from current store (may be scraped), replace basketball
      const existing = COMMITS.filter((c) => c.sport === 'Football');
      COMMITS = [...existing, ...topMapped, ...recent];

      // Clear cache so fresh data is served immediately
      try {
        const { clearCommitsCache } = await import('./commitsCache');
        clearCommitsCache();
        console.log('[commits] Basketball scrape complete, cache cleared');
      } catch { /* ignore if cache not available */ }
    } else {
      console.warn('[commits] Basketball scrape returned empty results — no data to display');
    }
  } catch (e) {
    console.error('[commits] Basketball scrape failed:', (e as Error)?.message);
  }
}

// Trigger server-side load
loadFootballFromScrape();
loadBasketballFromScrape();

export async function scrapeAndPersistCommits() {
  await loadFootballFromScrape();
  await loadBasketballFromScrape();
  return {
    footballScraped: SCRAPED_FOOTBALL,
    basketballScraped: SCRAPED_BASKETBALL,
    totalCommits: COMMITS.length,
  };
}
