import { formatSportLabel } from '@/features/recruiter/divisionMapping';

describe('formatSportLabel', () => {
  test('adds space between words in camel/compound names', () => {
    expect(formatSportLabel('WomensSoccer')).toBe('Womens Soccer');
    expect(formatSportLabel('MensBasketball')).toBe('Mens Basketball');
    expect(formatSportLabel('WomensCrossCountry')).toBe('Womens Cross Country');
    expect(formatSportLabel('Football')).toBe('Football');
  });
});


