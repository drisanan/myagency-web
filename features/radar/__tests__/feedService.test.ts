import { http } from '@/services/http';
import { getTrending, toggleWatchlist } from '@/features/radar/feedService';

jest.mock('@/services/http', () => ({ http: jest.fn() }));

describe('radar feedService', () => {
  test('getTrending calls endpoint with page', async () => {
    (http as jest.Mock).mockResolvedValueOnce([{ id: 'r1', name: 'Athlete A' }]);
    const res = await getTrending(2);
    expect(http).toHaveBeenCalledWith('/radar/trending?page=2', { method: 'GET' });
    expect(res).toEqual([{ id: 'r1', name: 'Athlete A' }]);
  });

  test('toggleWatchlist posts to endpoint', async () => {
    (http as jest.Mock).mockResolvedValueOnce({ ok: true });
    await toggleWatchlist({ athleteId: 'a1', follow: true });
    expect(http).toHaveBeenCalledWith('/radar/watchlist', {
      method: 'POST',
      body: { athleteId: 'a1', follow: true }
    });
  });
});


