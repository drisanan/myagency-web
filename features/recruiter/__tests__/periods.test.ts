import { listRecruitingPeriods, upsertRecruitingPeriods, RecruitingPeriod } from '@/services/recruitingPeriods';
import { getSports } from '@/features/recruiter/divisionMapping';

describe('recruiting periods store', () => {
  beforeEach(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.clear();
    }
  });

  test('lists seeded football periods', () => {
    const periods = listRecruitingPeriods('Football');
    expect(periods.length).toBeGreaterThan(0);
    expect(periods[0]).toHaveProperty('startDate');
  });

  test('upsert and list by sport', () => {
    const custom: RecruitingPeriod[] = [
      {
        id: 'bb-dead',
        sport: 'Basketball',
        label: 'Dead Period',
        type: 'dead',
        startDate: '2025-03-01',
        endDate: '2025-03-07',
      },
    ];
    upsertRecruitingPeriods(custom);
    const list = listRecruitingPeriods('Basketball');
    expect(list).toHaveLength(1);
    expect(list[0].label).toBe('Dead Period');
  });

  test('all sports have at least one period (fallback ensures quiet/contact)', () => {
    const sports = getSports();
    sports.forEach((sport) => {
      const periods = listRecruitingPeriods(sport);
      expect(periods.length).toBeGreaterThan(0);
      const hasQuiet = periods.some((p) => p.type === 'quiet');
      const hasContact = periods.some((p) => p.type === 'contact');
      expect(hasQuiet || hasContact).toBe(true);
    });
  });
});


