import { useQuery } from '@tanstack/react-query';
import { searchAthletes } from '@/features/recruiter/searchService';

export function useRecruiterSearch() {
  const query = useQuery({
    queryKey: ['recruiter', 'search', {}],
    queryFn: () => searchAthletes({ page: 1 })
  });
  return query;
}


