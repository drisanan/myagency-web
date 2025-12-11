import { upsertAgency, getAgencies } from '@/services/agencies';
import { upsertClient } from '@/services/clients';

describe('local persistence across reload', () => {
  beforeEach(() => {
    window.localStorage.removeItem('agencies_data');
    window.localStorage.removeItem('clients_data');
    window.localStorage.removeItem('session');
  });

  test('agency persists to localStorage and is visible after module reload', async () => {
    const created = await upsertAgency({ email: 'persist@an.test', name: 'Persist Inc', password: 'password123', active: true });
    expect(created.id).toBeTruthy();
    // simulate reload by re-importing module in isolation
    await new Promise<void>((resolve) => {
      jest.isolateModules(async () => {
        const mod = await import('@/services/agencies');
        const list = await mod.getAgencies();
        expect(list.find(a => a.email === 'persist@an.test')).toBeTruthy();
        resolve();
      });
    });
  });

  test('client persists to localStorage and is returned by tenancy-aware getClients', async () => {
    // seed an agency session
    window.localStorage.setItem('session', JSON.stringify({ role: 'agency', email: 'agency1@an.test' }));
    const c = await upsertClient({ email: 'persist@athletes.test', firstName: 'P', lastName: 'X', sport: 'Football', agencyEmail: 'agency1@an.test' });
    expect(c.id).toBeTruthy();
    await new Promise<void>((resolve) => {
      jest.isolateModules(async () => {
        const mod = await import('@/services/clients');
        const list = await mod.getClients();
        expect(list.find((x: any) => x.email === 'persist@athletes.test')).toBeTruthy();
        resolve();
      });
    });
  });
});


