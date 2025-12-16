/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { POST } from '../route';

const mockRehydrate = jest.fn();

jest.mock('@/services/commitsCache', () => ({
  rehydrateCommitsCache: () => mockRehydrate(),
}));

describe('commits rehydrate route', () => {
  const originalSecret = process.env.CRON_SECRET;

  beforeEach(() => {
    mockRehydrate.mockReset();
    process.env.CRON_SECRET = 'secret';
  });

  afterEach(() => {
    process.env.CRON_SECRET = originalSecret;
  });

  test('refreshes cache when secret matches', async () => {
    const req = new NextRequest('http://localhost/api/commits/rehydrate', {
      method: 'POST',
      headers: { 'x-cron-secret': 'secret' },
    });
    const res = await POST(req);
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.ok).toBe(true);
    expect(mockRehydrate).toHaveBeenCalledTimes(1);
  });

  test('returns 401 when secret is missing or invalid', async () => {
    const req = new NextRequest('http://localhost/api/commits/rehydrate', {
      method: 'POST',
    });
    const res = await POST(req);
    expect(res.status).toBe(401);
    expect(mockRehydrate).not.toHaveBeenCalled();
  });
});


