import { hashAccessCode, verifyAccessCode } from '../auth';

describe('auth access code hashing', () => {
  it('hashes and verifies', async () => {
    const code = 'abc123';
    const hash = await hashAccessCode(code);
    expect(hash).toBeTruthy();
    const ok = await verifyAccessCode(code, hash);
    expect(ok).toBe(true);
    const bad = await verifyAccessCode('wrong', hash);
    expect(bad).toBe(false);
  });
});

