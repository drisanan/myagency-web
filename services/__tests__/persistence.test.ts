import { Agency } from '@/services/agencies';
import { Client } from '@/services/clients';

describe('data types for persistence', () => {
  test('Agency type is well-formed', () => {
    const agency: Agency = {
      id: 'agency-001',
      email: 'persist@an.test',
      name: 'Persist Inc',
      active: true,
    };
    expect(agency.id).toBeTruthy();
    expect(agency.email).toBe('persist@an.test');
  });

  test('Client type is well-formed', () => {
    const client: Client = {
      id: 'client-001',
      email: 'persist@athletes.test',
      firstName: 'P',
      lastName: 'X',
      sport: 'Football',
      agencyEmail: 'agency1@an.test',
    };
    expect(client.id).toBeTruthy();
    expect(client.email).toBe('persist@athletes.test');
    expect(client.agencyEmail).toBe('agency1@an.test');
  });
});
