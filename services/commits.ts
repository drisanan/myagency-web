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

const footballPositions = ['QB', 'RB', 'WR', 'DL', 'LB', 'CB', 'S', 'TE', 'OL'];
const basketballPositions = ['PG', 'SG', 'SF', 'PF', 'C'];
const sources = ['ESPN', 'Rivals', '247Sports'];
const universities = ['Alabama', 'Georgia', 'Ohio State', 'Texas', 'Duke', 'Kentucky', 'Kansas', 'Gonzaga', 'Michigan'];

function isoDaysAgo(days: number) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function makeRecent(sport: Commit['sport'], prefix: string, positions: string[]): Commit[] {
  return Array.from({ length: 50 }).map((_, i) => ({
    id: `${prefix}-${i + 1}`,
    sport,
    list: 'recent' as const,
    name: `${sport} Recent ${i + 1}`,
    position: positions[i % positions.length],
    university: universities[i % universities.length],
    commitDate: isoDaysAgo(i * 5 + 1), // spread across ~250 days
    source: sources[i % sources.length],
  }));
}

function makeTop(sport: Commit['sport'], prefix: string, positions: string[]): Commit[] {
  return Array.from({ length: 50 }).map((_, i) => ({
    id: `${prefix}-${i + 1}`,
    sport,
    list: 'top' as const,
    rank: i + 1,
    name: `${sport} Top ${i + 1}`,
    position: positions[i % positions.length],
    university: universities[i % universities.length],
    stars: 5 - (i % 3) || 5,
    source: sources[i % sources.length],
  }));
}

const SEED: Commit[] = [
  ...makeRecent('Football', 'fb-rec', footballPositions),
  ...makeRecent('Basketball', 'bb-rec', basketballPositions),
  ...makeTop('Football', 'fb-top', footballPositions),
  ...makeTop('Basketball', 'bb-top', basketballPositions),
];

let COMMITS: Commit[] = [...SEED];
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

export function listCommitsServer(sport: Commit['sport'], list: Commit['list']) {
  // server-side version that does not touch localStorage
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
    } else {
      // mark placeholders so tests can detect non-live data
      COMMITS = COMMITS.map((c) =>
        c.sport === 'Football' ? { ...c, name: `${c.name} (placeholder)` } : c
      );
    }
  } catch (e) {
    // ignore and keep seed
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
    } else {
      COMMITS = COMMITS.map((c) =>
        c.sport === 'Basketball' ? { ...c, name: `${c.name} (placeholder)` } : c
      );
    }
  } catch (e) {
    // ignore and keep seed
  }
}

// Trigger server-side load
loadFootballFromScrape();
loadBasketballFromScrape();


