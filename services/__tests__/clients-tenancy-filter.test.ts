import { listClientsByAgencyEmail } from '@/services/clients';

describe('Clients tenancy filter', () => {
  test('returns only clients for agency email', async () => {
    const a1 = await listClientsByAgencyEmail('agency1@an.test');
    const a2 = await listClientsByAgencyEmail('agency2@an.test');
    expect(a1.every(c => c.agencyEmail === 'agency1@an.test')).toBe(true);
    expect(a2.every(c => c.agencyEmail === 'agency2@an.test')).toBe(true);
    // ensure different counts indicate different partitions in mock data
    expect(a1.length).toBeGreaterThan(0);
    expect(a2.length).toBeGreaterThan(0);
  });
});


