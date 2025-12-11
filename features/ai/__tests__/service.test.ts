import { askCounselor } from '@/features/ai/service';
import { http } from '@/services/http';

jest.mock('@/services/http', () => ({ http: jest.fn() }));

describe('ai service', () => {
  test('askCounselor posts question', async () => {
    (http as jest.Mock).mockResolvedValueOnce({ answer: 'ok' });
    const res = await askCounselor({ question: 'Q' });
    expect(http).toHaveBeenCalledWith('/ai/counselor', { method: 'POST', body: { question: 'Q' } });
    expect(res).toEqual({ answer: 'ok' });
  });
});


