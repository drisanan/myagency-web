import { getCachedCommits, clearCommitsCache } from '../commitsCache';
import * as commits from '../commits';

describe('commitsCache', () => {
  const start = new Date('2025-01-01T00:00:00Z');

  beforeEach(() => {
    clearCommitsCache();
    jest.useFakeTimers({ now: start });
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  test('reuses cached data within TTL and refetches after expiry', async () => {
    const spy = jest.spyOn(commits, 'listCommitsServer').mockReturnValue([
      { id: 'c1', sport: 'Football', list: 'recent', name: 'A' } as any,
    ]);

    const first = await getCachedCommits('Football', 'recent', 1000);
    const second = await getCachedCommits('Football', 'recent', 1000);
    expect(first).toEqual(second);
    expect(spy).toHaveBeenCalledTimes(1);

    jest.setSystemTime(new Date(start.getTime() + 2001));
    const third = await getCachedCommits('Football', 'recent', 1000);
    expect(third).toEqual(first);
    expect(spy).toHaveBeenCalledTimes(2);
  });
});


