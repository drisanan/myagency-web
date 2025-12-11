/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { GET } from '../route';

jest.mock('@/services/commitsCache', () => {
  return {
    getCachedCommits: jest.fn(async () => [
      { id: 't1', sport: 'Football', list: 'recent', name: 'Player 1' },
    ]),
  };
});

describe('commits route cache', () => {
  test('delegates to cached service and returns data', async () => {
    const req = new NextRequest('http://localhost/api/commits?sport=Football&list=recent');
    const res = await GET(req);
    const json = await res.json();
    expect(json.ok).toBe(true);
    expect(json.data).toHaveLength(1);

    const { getCachedCommits } = require('@/services/commitsCache');
    expect(getCachedCommits).toHaveBeenCalledWith('Football', 'recent');
  });
});


