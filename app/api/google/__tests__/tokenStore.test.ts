import { clearTokens, getTokens, saveTokens } from '../tokenStore';

describe('tokenStore', () => {
  beforeEach(() => clearTokens());

  it('saves and retrieves tokens by clientId', () => {
    const clientId = 'client-123';
    saveTokens(clientId, { access_token: 'a', refresh_token: 'r' });
    const t = getTokens(clientId);
    expect(t?.access_token).toBe('a');
    expect(t?.refresh_token).toBe('r');
  });

  it('falls back to default when clientId is empty', () => {
    saveTokens('', { access_token: 'x' });
    const t = getTokens('');
    expect(t?.access_token).toBe('x');
  });
});


