export const DIVISION_MAPPING: Record<string, string[]> = {
  Football: ['D1', 'D1AA', 'D2', 'D3', 'JUCO', 'NAIA'],
  Baseball: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  Softball: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  WomensSoccer: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  MensSoccer: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  MensBasketball: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  WomensBasketball: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  WomensTrack: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  WomensVolleyball: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  WomensSwimming: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  MensTrack: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  MensSwimming: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  WomensTennis: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  MensTennis: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  Dance: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  MensGymnastics: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  WomensGymnastics: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  MensHockey: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  WomensHockey: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  Cheerleading: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  WomensFlagFootball: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  MensGolf: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  WomensGolf: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  MensVolleyball: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  MensLacrosse: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  WomensLacrosse: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  WomensCrossCountry: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
  MensCrossCountry: ['D1', 'D2', 'D3', 'JUCO', 'NAIA'],
};

export function getSports(): string[] {
  return Object.keys(DIVISION_MAPPING);
}

export function getSportsForGender(gender: 'Mens' | 'Womens'): string[] {
  const all = Object.keys(DIVISION_MAPPING);
  const genderPrefix = gender;
  const gendered = all.filter(s => s.startsWith(genderPrefix));
  const neutral = all.filter(s => !s.startsWith('Mens') && !s.startsWith('Womens'));
  return [...gendered, ...neutral];
}

export function getDivisionsForSport(sport: string): string[] {
  return DIVISION_MAPPING[sport] ?? [];
}

export function formatSportLabel(sport: string): string {
  // Insert a space before capitals when preceded by a lowercase letter
  // e.g., WomensSoccer -> Womens Soccer, CrossCountry -> Cross Country
  return sport.replace(/([a-z])([A-Z])/g, '$1 $2');
}


