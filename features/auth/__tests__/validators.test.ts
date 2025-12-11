import { validateEmail, validatePassword } from '@/features/auth/validators';

describe('auth validators', () => {
  test('email validator', () => {
    expect(validateEmail('user@example.com')).toBe(true);
    expect(validateEmail('bad-email')).toBe(false);
  });

  test('password validator (min 8 chars)', () => {
    expect(validatePassword('12345678')).toBe(true);
    expect(validatePassword('short')).toBe(false);
  });
});


