import { AGENCIES, upsertAgency, getAgencyById, getAgencies, deleteAgency, updateAgencySettings } from '@/services/agencies';

describe('agencies service', () => {
  test('upsert, get, list, delete, and update settings', async () => {
    const beforeCount = (await getAgencies()).length;
    const created = await upsertAgency({
      email: 'new-agency@an.test',
      password: 'password123',
      name: 'New Agency',
      ownerFirstName: 'Ava',
      ownerLastName: 'Clark',
      ownerEmail: 'owner@new-agency.test',
      ownerPhone: '555-111-2222',
      active: true,
      settings: { primaryColor: '#ff5722', logoDataUrl: '' },
    });
    expect(created.id).toBeTruthy();

    const listed = await getAgencies();
    expect(listed.length).toBe(beforeCount + 1);
    expect(listed.find(a => a.id === created.id)?.name).toBe('New Agency');

    const fetched = await getAgencyById(created.id);
    expect(fetched?.email).toBe('new-agency@an.test');
    expect(fetched?.ownerFirstName).toBe('Ava');
    expect(fetched?.settings?.primaryColor).toBe('#ff5722');

    const current = await getAgencyById(created.id);
    expect(current).toBeTruthy();
    const updated = await updateAgencySettings(current!.email, { primaryColor: '#3f51b5' });
    expect(updated.ok).toBe(true);
    expect(updated.settings?.primaryColor).toBe('#3f51b5');

    await deleteAgency(created.id);
    const afterDelete = await getAgencies();
    expect(afterDelete.length).toBe(beforeCount);
  });
});


