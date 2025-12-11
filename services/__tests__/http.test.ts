import { http } from '@/services/http';

describe('http service', () => {
  beforeEach(() => {
    (global as any).fetch = jest.fn();
  });

  test('sends JSON and parses JSON', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ ok: true })
    });
    const res = await http<{ ok: boolean }>('/x', { method: 'POST', body: { a: 1 } });
    expect(res.ok).toBe(true);
    expect(global.fetch).toHaveBeenCalled();
  });

  test('throws on HTTP error', async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: 'ERR',
      text: async () => 'boom'
    });
    await expect(http('/err')).rejects.toThrow('HTTP 500: boom');
  });
});


