import { checkCnameMatches } from '../domainValidator';

const resolveCnameMock = jest.fn();
const setServersMock = jest.fn();

jest.mock('node:dns', () => ({
  __esModule: true,
  default: {
    promises: {
      Resolver: class {
        setServers = setServersMock;
        resolveCname = (host: string) => resolveCnameMock(host);
      },
    },
  },
}));

describe('checkCnameMatches', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('rejects apex hostnames via normalizeHostname', async () => {
    await expect(
      checkCnameMatches({ hostname: 'acme.com', expected: 'x' }),
    ).rejects.toThrow();
    expect(resolveCnameMock).not.toHaveBeenCalled();
  });

  it('returns matches=true when any resolver reports expected target', async () => {
    resolveCnameMock
      .mockResolvedValueOnce([])
      .mockResolvedValueOnce(['d123.cloudfront.net.'])
      .mockResolvedValueOnce([]);

    const res = await checkCnameMatches({
      hostname: 'app.acme.com',
      expected: 'd123.cloudfront.net',
    });
    expect(res.matches).toBe(true);
    expect(res.hostname).toBe('app.acme.com');
    expect(res.perResolver).toHaveLength(3);
    expect(res.perResolver[1].records).toContain('d123.cloudfront.net.');
  });

  it('returns matches=false when no resolver matches', async () => {
    resolveCnameMock.mockResolvedValue(['other.example.net.']);
    const res = await checkCnameMatches({
      hostname: 'app.acme.com',
      expected: 'd123.cloudfront.net',
    });
    expect(res.matches).toBe(false);
  });

  it('captures resolver errors without throwing', async () => {
    resolveCnameMock.mockImplementation(() => {
      throw new Error('ENOTFOUND');
    });
    const res = await checkCnameMatches({
      hostname: 'app.acme.com',
      expected: 'x',
      resolvers: ['google'],
    });
    expect(res.perResolver[0].error).toMatch(/ENOTFOUND/);
    expect(res.matches).toBe(false);
  });

  it('uses google/cloudflare resolvers unless overridden', async () => {
    resolveCnameMock.mockResolvedValue([]);
    await checkCnameMatches({ hostname: 'app.acme.com', expected: 'x' });
    expect(setServersMock).toHaveBeenCalledWith(['8.8.8.8', '8.8.4.4']);
    expect(setServersMock).toHaveBeenCalledWith(['1.1.1.1', '1.0.0.1']);
  });
});
