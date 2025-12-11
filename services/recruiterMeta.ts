export async function getDivisions(): Promise<string[]> {
  return ['D1', 'D1AA', 'D2', 'D3', 'JUCO', 'NAIA'];
}
export async function getStates(division: string): Promise<Array<{ code: string; name: string }>> {
  // Return all US states (and DC); division is ignored intentionally
  return [
    { code: 'AL', name: 'Alabama' },
    { code: 'AK', name: 'Alaska' },
    { code: 'AZ', name: 'Arizona' },
    { code: 'AR', name: 'Arkansas' },
    { code: 'CA', name: 'California' },
    { code: 'CO', name: 'Colorado' },
    { code: 'CT', name: 'Connecticut' },
    { code: 'DE', name: 'Delaware' },
    { code: 'FL', name: 'Florida' },
    { code: 'GA', name: 'Georgia' },
    { code: 'HI', name: 'Hawaii' },
    { code: 'ID', name: 'Idaho' },
    { code: 'IL', name: 'Illinois' },
    { code: 'IN', name: 'Indiana' },
    { code: 'IA', name: 'Iowa' },
    { code: 'KS', name: 'Kansas' },
    { code: 'KY', name: 'Kentucky' },
    { code: 'LA', name: 'Louisiana' },
    { code: 'ME', name: 'Maine' },
    { code: 'MD', name: 'Maryland' },
    { code: 'MA', name: 'Massachusetts' },
    { code: 'MI', name: 'Michigan' },
    { code: 'MN', name: 'Minnesota' },
    { code: 'MS', name: 'Mississippi' },
    { code: 'MO', name: 'Missouri' },
    { code: 'MT', name: 'Montana' },
    { code: 'NE', name: 'Nebraska' },
    { code: 'NV', name: 'Nevada' },
    { code: 'NH', name: 'New Hampshire' },
    { code: 'NJ', name: 'New Jersey' },
    { code: 'NM', name: 'New Mexico' },
    { code: 'NY', name: 'New York' },
    { code: 'NC', name: 'North Carolina' },
    { code: 'ND', name: 'North Dakota' },
    { code: 'OH', name: 'Ohio' },
    { code: 'OK', name: 'Oklahoma' },
    { code: 'OR', name: 'Oregon' },
    { code: 'PA', name: 'Pennsylvania' },
    { code: 'RI', name: 'Rhode Island' },
    { code: 'SC', name: 'South Carolina' },
    { code: 'SD', name: 'South Dakota' },
    { code: 'TN', name: 'Tennessee' },
    { code: 'TX', name: 'Texas' },
    { code: 'UT', name: 'Utah' },
    { code: 'VT', name: 'Vermont' },
    { code: 'VA', name: 'Virginia' },
    { code: 'WA', name: 'Washington' },
    { code: 'WV', name: 'West Virginia' },
    { code: 'WI', name: 'Wisconsin' },
    { code: 'WY', name: 'Wyoming' },
    { code: 'DC', name: 'District of Columbia' },
  ];
}
export async function getUniversities(input: { division: string; state: string }): Promise<Array<{ id: string; name: string }>> {
  return [
    { id: 'uni-1', name: 'Sample University' },
    { id: 'uni-2', name: 'Example College' },
  ];
}
export async function getUniversity(id: string): Promise<{
  id: string;
  name: string;
  city: string;
  state: string;
  division: string;
  conference?: string;
  privatePublic?: string;
  coaches: Array<{ id: string; firstName: string; lastName: string; title: string; email?: string; twitter?: string; instagram?: string }>;
}> {
  return {
    id,
    name: id === 'uni-2' ? 'Example College' : 'Sample University',
    city: 'Somewhere',
    state: 'CA',
    division: 'D1',
    conference: 'West',
    privatePublic: 'Public',
    coaches: [
      { id: 'c1', firstName: 'Alex', lastName: 'Mason', title: 'Head Coach', email: 'alex.mason@school.edu', twitter: 'https://x.com/coachmason' },
      { id: 'c2', firstName: 'Blake', lastName: 'Reed', title: 'Assistant Coach', email: 'blake.reed@school.edu' },
    ],
  };
}


