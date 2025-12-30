import { Client } from '@/services/clients';

describe('Clients tenancy types', () => {
  test('Client type has agencyEmail for tenancy filtering', () => {
    const client: Client = {
      id: 'client-001',
      email: 'athlete@test.com',
      firstName: 'John',
      lastName: 'Doe',
      sport: 'Football',
      agencyEmail: 'agency1@an.test',
    };
    expect(client.agencyEmail).toBe('agency1@an.test');
    expect(client.id).toBe('client-001');
  });

  test('Clients can be filtered by agencyEmail', () => {
    const clients: Client[] = [
      { id: 'c1', email: 'a1@test.com', firstName: 'A', lastName: '1', sport: 'Football', agencyEmail: 'agency1@an.test' },
      { id: 'c2', email: 'a2@test.com', firstName: 'A', lastName: '2', sport: 'Basketball', agencyEmail: 'agency2@an.test' },
      { id: 'c3', email: 'a3@test.com', firstName: 'A', lastName: '3', sport: 'Football', agencyEmail: 'agency1@an.test' },
    ];
    const agency1Clients = clients.filter((c: Client) => c.agencyEmail === 'agency1@an.test');
    const agency2Clients = clients.filter((c: Client) => c.agencyEmail === 'agency2@an.test');
    expect(agency1Clients).toHaveLength(2);
    expect(agency2Clients).toHaveLength(1);
  });
});
