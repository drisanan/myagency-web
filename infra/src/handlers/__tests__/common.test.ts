/**
 * @jest-environment node
 */

describe('common session helpers', () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    jest.resetModules();
    jest.clearAllMocks();
  });

  it('does not trust header fallback by default', () => {
    jest.doMock('../../lib/session', () => ({
      parseSessionFromRequest: jest.fn(() => null),
    }));

    let commonModule: any;
    jest.isolateModules(() => {
      commonModule = require('../common');
    });
    const { getSession } = commonModule;
    const session = getSession({
      headers: {
        'x-agency-id': 'agency-001',
        'x-agency-email': 'agency@test.com',
      },
    });

    expect(session).toBeNull();
  });

  it('allows header fallback only when explicitly enabled offline', () => {
    process.env.IS_OFFLINE = 'true';
    process.env.ALLOW_HEADER_SESSION_FALLBACK = 'true';

    jest.doMock('../../lib/session', () => ({
      parseSessionFromRequest: jest.fn(() => null),
    }));

    let commonModule: any;
    jest.isolateModules(() => {
      commonModule = require('../common');
    });
    const { getSession } = commonModule;
    const session = getSession({
      headers: {
        'x-agency-id': 'agency-001',
        'x-agency-email': 'agency@test.com',
        'x-role': 'agency',
      },
    });

    expect(session).toEqual({
      agencyId: 'agency-001',
      agencyEmail: 'agency@test.com',
      role: 'agency',
    });
  });
});
