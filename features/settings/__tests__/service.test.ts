import { http } from '@/services/http';
import { getProfile, updateProfile } from '@/features/settings/service';

jest.mock('@/services/http', () => ({ http: jest.fn() }));

describe('settings service', () => {
  test('getProfile returns profile', async () => {
    (http as jest.Mock).mockResolvedValueOnce({ name: 'User', email: 'u@example.com' });
    const res = await getProfile();
    expect(http).toHaveBeenCalledWith('/settings/profile', { method: 'GET' });
    expect(res).toEqual({ name: 'User', email: 'u@example.com' });
  });

  test('updateProfile posts profile', async () => {
    (http as jest.Mock).mockResolvedValueOnce({ ok: true });
    await updateProfile({ name: 'New', email: 'n@example.com' });
    expect(http).toHaveBeenCalledWith('/settings/profile', { method: 'PUT', body: { name: 'New', email: 'n@example.com' } });
  });
});


