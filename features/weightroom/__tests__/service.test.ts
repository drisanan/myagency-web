import { http } from '@/services/http';
import { register, getSessions } from '@/features/weightroom/service';

jest.mock('@/services/http', () => ({ http: jest.fn() }));

describe('weightroom service', () => {
  test('register posts registrant', async () => {
    (http as jest.Mock).mockResolvedValueOnce({ ok: true });
    await register({ name: 'User', email: 'u@example.com' });
    expect(http).toHaveBeenCalledWith('/weightroom/register', { method: 'POST', body: { name: 'User', email: 'u@example.com' } });
  });

  test('getSessions fetches list', async () => {
    (http as jest.Mock).mockResolvedValueOnce([{ id: 's1', title: 'Bench' }]);
    const res = await getSessions();
    expect(http).toHaveBeenCalledWith('/weightroom/sessions', { method: 'GET' });
    expect(res).toEqual([{ id: 's1', title: 'Bench' }]);
  });
});


