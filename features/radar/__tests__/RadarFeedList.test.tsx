import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { TestProviders } from '@/tests/TestProviders';
import { RadarFeedList } from '@/features/radar/RadarFeedList';
import * as feed from '@/features/radar/feedService';

jest.spyOn(feed, 'getTrending');
jest.spyOn(feed, 'toggleWatchlist');

describe('RadarFeedList', () => {
  test('renders trending feed and follows', async () => {
    (feed.getTrending as jest.Mock).mockResolvedValueOnce([
      { id: 'a1', name: 'Athlete A' }
    ]);
    (feed.toggleWatchlist as jest.Mock).mockResolvedValueOnce({ ok: true });
    render(
      <TestProviders>
        <RadarFeedList />
      </TestProviders>
    );
    expect(await screen.findByText(/athlete a/i)).toBeInTheDocument();
    await userEvent.click(screen.getByRole('button', { name: /follow/i }));
    expect(feed.toggleWatchlist).toHaveBeenCalledWith({ athleteId: 'a1', follow: true });
  });
});


