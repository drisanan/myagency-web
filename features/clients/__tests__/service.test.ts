import { getClients, listClientsByAgency, upsertClient, getClient, deleteClient } from '@/services/clients';

describe('clients service', () => {
  test('listClientsByAgency returns clients', async () => {
    const res = await listClientsByAgency('agency-001');
    expect(res.length).toBeGreaterThan(0);
    expect(res[0]).toHaveProperty('agencyEmail');
  });
  test('getClients delegates to list', async () => {
    const res = await getClients();
    expect(Array.isArray(res)).toBe(true);
  });
  test('upsert returns id', async () => {
    const res = await upsertClient({ email: 'a@b.com', password: '12345678', firstName: 'A', lastName: 'B', sport: 'Football' });
    expect(res).toHaveProperty('id');
  });
  test('getClient returns by id', async () => {
    const res = await getClient('c1');
    expect(res).toHaveProperty('id', 'c1');
  });
  test('deleteClient returns ok', async () => {
    const res = await deleteClient('c1');
    expect(res).toHaveProperty('ok', true);
  });
});


