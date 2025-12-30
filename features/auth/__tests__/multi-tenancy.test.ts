import { Session } from '@/features/auth/service';

describe('Multi-tenant auth types', () => {
  test('Session type has expected shape for agency role', () => {
    const session: Session = {
      role: 'agency',
      email: 'agency1@an.test',
      agencyId: 'agency-001',
    };
    expect(session.role).toBe('agency');
    expect(session.email).toBe('agency1@an.test');
    expect(session.agencyId).toBeDefined();
  });

  test('Session type supports client role', () => {
    const session: Session = {
      role: 'client',
      email: 'client@test.com',
      clientId: 'client-001',
    };
    expect(session.role).toBe('client');
    expect(session.clientId).toBeDefined();
  });
});
