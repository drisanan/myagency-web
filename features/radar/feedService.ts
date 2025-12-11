import { http } from '@/services/http';
import { z } from 'zod';

export async function getTrending(page = 1) {
  return http<Array<{ id: string; name: string }>>(`/radar/trending?page=${page}`, { method: 'GET' });
}

const ToggleSchema = z.object({
  athleteId: z.string(),
  follow: z.boolean()
});

export type ToggleWatchlistInput = z.infer<typeof ToggleSchema>;

export async function toggleWatchlist(input: ToggleWatchlistInput) {
  const body = ToggleSchema.parse(input);
  return http<{ ok: boolean }>(`/radar/watchlist`, { method: 'POST', body });
}


