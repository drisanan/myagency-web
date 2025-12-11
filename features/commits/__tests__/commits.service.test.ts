import {
  listCommits,
  filterCommits,
  upsertCommits,
  Commit,
  footballScrapeStatus,
  basketballScrapeStatus,
} from '@/services/commits';

describe('commits service', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  test('lists football recent max 50 sorted by commitDate', () => {
    const list = listCommits('Football', 'recent');
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(50);
    for (let i = 1; i < list.length; i++) {
      expect((list[i - 1].commitDate || '') >= (list[i].commitDate || '')).toBe(true);
    }
  });

  test('lists basketball top sorted by rank', () => {
    const list = listCommits('Basketball', 'top');
    expect(list.length).toBeGreaterThan(0);
    expect(list.length).toBeLessThanOrEqual(50);
    for (let i = 1; i < list.length; i++) {
      expect((list[i - 1].rank ?? 9999) <= (list[i].rank ?? 9999)).toBe(true);
    }
  });

  test('filter commits by position and university', () => {
    const all = listCommits('Football', 'recent');
    const filtered = filterCommits(all, { position: 'QB', university: 'Alabama' });
    filtered.forEach((c) => {
      expect((c.position || '').toLowerCase()).toContain('qb');
      expect((c.university || '').toLowerCase()).toContain('alabama');
    });
  });

  test('upsert commits respects limit 50', () => {
    const bulk: Commit[] = Array.from({ length: 60 }).map((_, i) => ({
      id: `fb-top-${i}`,
      sport: 'Football',
      list: 'top',
      rank: i + 1,
      name: `P${i}`,
    }));
    upsertCommits(bulk);
    const list = listCommits('Football', 'top');
    expect(list.length).toBe(50);
    expect(list[0].rank).toBe(1);
    expect(list[49].rank).toBe(50);
  });

  test('scraped football top loads into top list when available', async () => {
    const { scraped } = footballScrapeStatus();
    const list = listCommits('Football', 'top');
    expect(list.length).toBeGreaterThan(0);
    if (scraped) {
      expect(list[0].name.toLowerCase()).not.toContain('placeholder');
    }
  });

  test('scraped basketball top loads into top list when available', async () => {
    const { scraped } = basketballScrapeStatus();
    const list = listCommits('Basketball', 'top');
    expect(list.length).toBeGreaterThan(0);
    if (scraped) {
      expect(list[0].name.toLowerCase()).not.toContain('placeholder');
    }
  });
});


