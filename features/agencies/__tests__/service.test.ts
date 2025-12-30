import { Agency } from '@/services/agencies';

describe('agencies service types', () => {
  test('Agency type has expected shape', () => {
    const agency: Agency = {
      id: 'agency-001',
      email: 'agency@test.com',
      name: 'Test Agency',
      ownerFirstName: 'John',
      ownerLastName: 'Doe',
      ownerEmail: 'owner@test.com',
      ownerPhone: '555-123-4567',
      active: true,
      settings: {
        primaryColor: '#ff5722',
        logoDataUrl: '',
      },
    };
    expect(agency.id).toBe('agency-001');
    expect(agency.email).toBe('agency@test.com');
    expect(agency.name).toBe('Test Agency');
    expect(agency.settings?.primaryColor).toBe('#ff5722');
  });
});
