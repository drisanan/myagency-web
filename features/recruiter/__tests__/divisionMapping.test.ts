import { formatSportLabel, getSports, getDivisionsForSport } from '@/features/recruiter/divisionMapping';

describe('formatSportLabel', () => {
  test('adds space between words in camel/compound names', () => {
    expect(formatSportLabel('WomensSoccer')).toBe('Womens Soccer');
    expect(formatSportLabel('MensBasketball')).toBe('Mens Basketball');
    expect(formatSportLabel('WomensCrossCountry')).toBe('Womens Cross Country');
    expect(formatSportLabel('Football')).toBe('Football');
  });

  test('formats ice hockey sports correctly', () => {
    expect(formatSportLabel('MensIceHockey')).toBe('Mens Ice Hockey');
    expect(formatSportLabel('WomensIceHockey')).toBe('Womens Ice Hockey');
  });
});

describe('getSports', () => {
  test('includes ice hockey sports', () => {
    const sports = getSports();
    expect(sports).toContain('MensIceHockey');
    expect(sports).toContain('WomensIceHockey');
  });
});

describe('getDivisionsForSport', () => {
  test('returns divisions for ice hockey', () => {
    expect(getDivisionsForSport('MensIceHockey')).toEqual(['D1', 'D2', 'D3', 'JUCO', 'NAIA']);
    expect(getDivisionsForSport('WomensIceHockey')).toEqual(['D1', 'D2', 'D3', 'JUCO', 'NAIA']);
  });
});


