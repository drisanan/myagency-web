import { consumeRateLimit, resetRateLimit } from '../rateLimit';

describe('consumeRateLimit', () => {
  beforeEach(() => resetRateLimit());

  it('allows calls up to the limit within the window', () => {
    const r1 = consumeRateLimit('k', 3, 60_000);
    const r2 = consumeRateLimit('k', 3, 60_000);
    const r3 = consumeRateLimit('k', 3, 60_000);
    expect(r1.allowed).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r2.allowed).toBe(true);
    expect(r3.allowed).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it('blocks the N+1 call within the same window', () => {
    consumeRateLimit('k', 2, 60_000);
    consumeRateLimit('k', 2, 60_000);
    const blocked = consumeRateLimit('k', 2, 60_000);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
  });

  it('treats different keys independently', () => {
    consumeRateLimit('a', 1, 60_000);
    const other = consumeRateLimit('b', 1, 60_000);
    expect(other.allowed).toBe(true);
  });

  it('resets after the window expires', () => {
    jest.useFakeTimers().setSystemTime(new Date(1_000_000));
    consumeRateLimit('k', 1, 1000);
    const blocked = consumeRateLimit('k', 1, 1000);
    expect(blocked.allowed).toBe(false);
    jest.setSystemTime(new Date(1_000_000 + 1100));
    const ok = consumeRateLimit('k', 1, 1000);
    expect(ok.allowed).toBe(true);
    jest.useRealTimers();
  });
});
