import { getEntitlement } from '@/features/paywall/service';
import { http } from '@/services/http';

jest.mock('@/services/http', () => ({ http: jest.fn() }));

describe('paywall service', () => {
  test('getEntitlement queries endpoint', async () => {
    (http as jest.Mock).mockResolvedValueOnce({ entitled: true });
    const res = await getEntitlement('premium');
    expect(http).toHaveBeenCalledWith('/paywall/entitlement?feature=premium', { method: 'GET' });
    expect(res).toEqual({ entitled: true });
  });
});


