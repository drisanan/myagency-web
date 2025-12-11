import { login } from '@/features/auth/service';

describe('Multi-tenant auth', () => {
  test('parent login works', async () => {
    const s = await login({ email: 'admin@example.com', password: 'password123' });
    expect(s.role).toBe('parent');
  });

  test('agency logins map to agencies by email', async () => {
    const a1 = await login({ email: 'agency1@an.test', password: 'password123' });
    const a2 = await login({ email: 'agency2@an.test', password: 'password123' });
    const a3 = await login({ email: 'agency3@an.test', password: 'password123' });
    expect(a1.role).toBe('agency');
    expect(a2.role).toBe('agency');
    expect(a3.role).toBe('agency');
    expect(a1.email).toBe('agency1@an.test');
    expect(a2.email).toBe('agency2@an.test');
    expect(a3.email).toBe('agency3@an.test');
    expect(a1.agencyId).toBeDefined();
    expect(a2.agencyId).toBeDefined();
    expect(a3.agencyId).toBeDefined();
  });
});


