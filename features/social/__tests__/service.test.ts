import { generateSharePreview } from '@/features/social/service';
import { http } from '@/services/http';

jest.mock('@/services/http', () => ({ http: jest.fn() }));

describe('social service', () => {
  test('generateSharePreview posts caption', async () => {
    (http as jest.Mock).mockResolvedValueOnce({ url: 'x' });
    const res = await generateSharePreview({ caption: 'hello' });
    expect(http).toHaveBeenCalledWith('/social/preview', { method: 'POST', body: { caption: 'hello' } });
    expect(res).toEqual({ url: 'x' });
  });
});


