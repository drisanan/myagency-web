import { http } from '@/services/http';
import { searchAthletes } from '@/features/recruiter/searchService';

jest.mock('@/services/http', () => ({
  http: jest.fn()
}));

describe('recruiter searchService', () => {
  test('calls search endpoint and returns results', async () => {
    (http as jest.Mock).mockResolvedValueOnce([{ id: 'a1', name: 'Jane Doe' }]);
    const results = await searchAthletes({ sport: 'soccer', page: 1 });
    expect(http).toHaveBeenCalledWith('/recruiter/search?sport=soccer&page=1', { method: 'GET' });
    expect(results).toEqual([{ id: 'a1', name: 'Jane Doe' }]);
  });
});


