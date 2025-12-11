export type RecruitingPeriodType = 'dead' | 'contact' | 'quiet' | 'eval' | 'test' | 'other';

export type RecruitingPeriod = {
  id: string;
  sport: string;
  label: string;
  type: RecruitingPeriodType;
  startDate: string; // ISO
  endDate: string;   // ISO
};

const STORAGE_KEY = 'recruiting_periods_data';

const SEED: RecruitingPeriod[] = [
  // Football FBS (multiple quiet/contact windows)
  { id: 'fb-dead-jan', sport: 'Football', label: 'Dead Period', type: 'dead', startDate: '2025-01-06', endDate: '2025-01-12' },
  { id: 'fb-contact-jan', sport: 'Football', label: 'Contact Period', type: 'contact', startDate: '2025-01-13', endDate: '2025-02-02' },
  { id: 'fb-quiet-dec', sport: 'Football', label: 'Quiet Period', type: 'quiet', startDate: '2025-12-01', endDate: '2025-12-21' },
  { id: 'fb-contact-dec', sport: 'Football', label: 'Contact Period', type: 'contact', startDate: '2025-12-31', endDate: '2026-01-04' },
  { id: 'fb-quiet-jan', sport: 'Football', label: 'Quiet Period', type: 'quiet', startDate: '2026-01-11', endDate: '2026-01-11' },
  { id: 'fb-quiet-feb', sport: 'Football', label: 'Quiet Period', type: 'quiet', startDate: '2026-02-01', endDate: '2026-02-01' },
  { id: 'fb-quiet-mar', sport: 'Football', label: 'Quiet Period', type: 'quiet', startDate: '2026-03-02', endDate: '2026-04-14' },
  { id: 'fb-quiet-jun', sport: 'Football', label: 'Quiet Period', type: 'quiet', startDate: '2026-05-28', endDate: '2026-06-22' },
  { id: 'fb-test-feb', sport: 'Football', label: 'SAT Window', type: 'test', startDate: '2025-02-08', endDate: '2025-02-08' },

  // Football FCS quiet windows
  { id: 'fcs-quiet-dec', sport: 'Football FCS', label: 'Quiet Period', type: 'quiet', startDate: '2025-12-19', endDate: '2025-12-21' },
  { id: 'fcs-quiet-dec2', sport: 'Football FCS', label: 'Quiet Period', type: 'quiet', startDate: '2025-12-31', endDate: '2026-01-04' },
  { id: 'fcs-quiet-jan', sport: 'Football FCS', label: 'Quiet Period', type: 'quiet', startDate: '2026-01-11', endDate: '2026-01-11' },
  { id: 'fcs-quiet-feb', sport: 'Football FCS', label: 'Quiet Period', type: 'quiet', startDate: '2026-02-01', endDate: '2026-02-01' },
  { id: 'fcs-quiet-mar', sport: 'Football FCS', label: 'Quiet Period', type: 'quiet', startDate: '2026-03-02', endDate: '2026-04-14' },

  // Baseball quiet windows
  { id: 'bb-quiet-aug', sport: 'Baseball', label: 'Quiet Period', type: 'quiet', startDate: '2025-08-18', endDate: '2025-09-11' },
  { id: 'bb-quiet-oct', sport: 'Baseball', label: 'Quiet Period', type: 'quiet', startDate: '2025-10-13', endDate: '2026-02-28' },
  { id: 'bb-quiet-dec', sport: 'Baseball', label: 'Quiet Period', type: 'quiet', startDate: '2025-12-08', endDate: '2025-12-21' },

  // Men's Basketball quiet/contact
  { id: 'mbb-quiet-aug', sport: "Men's Basketball", label: 'Quiet Period', type: 'quiet', startDate: '2025-08-01', endDate: '2025-09-02' },
  { id: 'mbb-contact-may', sport: "Men's Basketball", label: 'Contact Period', type: 'contact', startDate: '2026-05-01', endDate: '2026-06-30' },
  { id: 'mbb-quiet-dec', sport: "Men's Basketball", label: 'Quiet Period', type: 'quiet', startDate: '2025-12-08', endDate: '2025-12-21' },

  // Women's Basketball quiet/contact
  { id: 'wbb-quiet-aug', sport: "Women's Basketball", label: 'Quiet Period', type: 'quiet', startDate: '2025-08-01', endDate: '2025-08-31' },
  { id: 'wbb-contact-mar', sport: "Women's Basketball", label: 'Contact Period', type: 'contact', startDate: '2026-03-01', endDate: '2026-04-01' },
  { id: 'wbb-quiet-dec', sport: "Women's Basketball", label: 'Quiet Period', type: 'quiet', startDate: '2025-12-08', endDate: '2025-12-21' },

  // Women's Volleyball quiet windows
  { id: 'wvb-quiet-aug', sport: "Women's Volleyball", label: 'Quiet Period', type: 'quiet', startDate: '2025-08-01', endDate: '2025-08-31' },
  { id: 'wvb-quiet-dec', sport: "Women's Volleyball", label: 'Quiet Period', type: 'quiet', startDate: '2025-12-08', endDate: '2025-12-21' },

  // Softball quiet windows
  { id: 'soft-quiet-dec', sport: 'Softball', label: 'Quiet Period', type: 'quiet', startDate: '2025-12-08', endDate: '2025-12-21' },

  // Soccer quiet windows
  { id: 'msoc-quiet-dec', sport: "Men's Soccer", label: 'Quiet Period', type: 'quiet', startDate: '2025-12-08', endDate: '2025-12-21' },
  { id: 'wsoc-quiet-dec', sport: "Women's Soccer", label: 'Quiet Period', type: 'quiet', startDate: '2025-12-08', endDate: '2025-12-21' },

  // Lacrosse quiet windows
  { id: 'mlax-quiet-dec', sport: "Men's Lacrosse", label: 'Quiet Period', type: 'quiet', startDate: '2025-12-08', endDate: '2025-12-23' },
  { id: 'wlax-quiet-dec', sport: "Women's Lacrosse", label: 'Quiet Period', type: 'quiet', startDate: '2025-12-08', endDate: '2025-12-23' },
];

function readStore(): RecruitingPeriod[] {
  if (typeof window === 'undefined') return [...SEED];
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return [...SEED];
  try {
    const parsed = JSON.parse(raw) as RecruitingPeriod[];
    return parsed.length ? parsed : [...SEED];
  } catch {
    return [...SEED];
  }
}

function writeStore(items: RecruitingPeriod[]) {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

let PERIODS: RecruitingPeriod[] = readStore();

function buildFallbackPeriods(sport: string): RecruitingPeriod[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const startQuiet = new Date(today);
  const endQuiet = new Date(today);
  endQuiet.setDate(endQuiet.getDate() + 6);
  const startContact = new Date(today);
  startContact.setDate(startContact.getDate() + 7);
  const endContact = new Date(today);
  endContact.setDate(endContact.getDate() + 13);
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  return [
    {
      id: `${sport}-quiet-fallback`,
      sport,
      label: 'Quiet Period',
      type: 'quiet',
      startDate: iso(startQuiet),
      endDate: iso(endQuiet),
    },
    {
      id: `${sport}-contact-fallback`,
      sport,
      label: 'Contact Period',
      type: 'contact',
      startDate: iso(startContact),
      endDate: iso(endContact),
    },
  ];
}

export function listRecruitingPeriods(sport: string) {
  if (typeof window !== 'undefined') PERIODS = readStore();
  const filtered = PERIODS.filter((p) => p.sport === sport).sort((a, b) => a.startDate.localeCompare(b.startDate));
  if (filtered.length === 0) {
    return buildFallbackPeriods(sport);
  }
  return filtered;
}

export function upsertRecruitingPeriods(periods: RecruitingPeriod[]) {
  PERIODS = periods;
  writeStore(PERIODS);
  return PERIODS;
}


