import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTrending, toggleWatchlist, ToggleWatchlistInput } from '@/features/radar/feedService';

export function useRadarFeed(page = 1) {
  const queryClient = useQueryClient();
  const feedQuery = useQuery({
    queryKey: ['radar', 'trending', page],
    queryFn: () => getTrending(page)
  });
  const followMutation = useMutation({
    mutationFn: (input: ToggleWatchlistInput) => toggleWatchlist(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['radar', 'trending'] });
    }
  });
  return { feedQuery, followMutation };
}


