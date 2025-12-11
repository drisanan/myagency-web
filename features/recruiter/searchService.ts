import { http } from '@/services/http';
import { z } from 'zod';

const SearchParams = z.object({
  sport: z.string().optional(),
  position: z.string().optional(),
  page: z.number().int().positive().default(1)
});

export type SearchParams = z.infer<typeof SearchParams>;

export async function searchAthletes(params: SearchParams) {
  const { sport, position, page } = SearchParams.parse(params);
  const qs = new URLSearchParams();
  if (sport) qs.set('sport', sport);
  if (position) qs.set('position', position);
  qs.set('page', String(page));
  return http<Array<{ id: string; name: string }>>(`/recruiter/search?${qs.toString()}`, { method: 'GET' });
}


