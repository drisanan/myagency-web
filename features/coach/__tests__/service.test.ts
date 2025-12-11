import { http } from '@/services/http';
import { getRoster, addNote } from '@/features/coach/service';

jest.mock('@/services/http', () => ({ http: jest.fn() }));

describe('coach service', () => {
  test('getRoster fetches roster', async () => {
    (http as jest.Mock).mockResolvedValueOnce([{ id: 'p1', name: 'Player 1' }]);
    const res = await getRoster();
    expect(http).toHaveBeenCalledWith('/coach/roster', { method: 'GET' });
    expect(res).toEqual([{ id: 'p1', name: 'Player 1' }]);
  });

  test('addNote posts note', async () => {
    (http as jest.Mock).mockResolvedValueOnce({ ok: true });
    await addNote({ athleteId: 'p1', text: 'Great effort' });
    expect(http).toHaveBeenCalledWith('/coach/note', { method: 'POST', body: { athleteId: 'p1', text: 'Great effort' } });
  });
});


