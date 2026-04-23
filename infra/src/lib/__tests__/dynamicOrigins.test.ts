const sendMock = jest.fn();

jest.mock('../../handlers/common', () => ({
  docClient: { send: (...args: unknown[]) => sendMock(...args) },
}));

import {
  __clearDynamicOriginsCache,
  isDynamicallyAllowedOrigin,
} from '../dynamicOrigins';

describe('dynamicOrigins.isDynamicallyAllowedOrigin', () => {
  beforeEach(() => {
    sendMock.mockReset();
    __clearDynamicOriginsCache();
  });

  it('rejects non-https or unparseable origins', async () => {
    expect(await isDynamicallyAllowedOrigin('not a url')).toBe(false);
    expect(await isDynamicallyAllowedOrigin('http://app.acme.com')).toBe(false);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('allows origins with an ACTIVE DOMAIN# row', async () => {
    sendMock.mockResolvedValueOnce({ Items: [{ status: 'ACTIVE' }] });
    expect(await isDynamicallyAllowedOrigin('https://app.acme.com')).toBe(true);
  });

  it('rejects origins with non-ACTIVE DOMAIN# status', async () => {
    sendMock.mockResolvedValueOnce({ Items: [{ status: 'PENDING_DNS' }] });
    expect(await isDynamicallyAllowedOrigin('https://app.acme.com')).toBe(false);
  });

  it('rejects origins with no DOMAIN# row', async () => {
    sendMock.mockResolvedValueOnce({ Items: [] });
    expect(await isDynamicallyAllowedOrigin('https://unknown.example.com')).toBe(false);
  });

  it('caches positive results (no second query)', async () => {
    sendMock.mockResolvedValueOnce({ Items: [{ status: 'ACTIVE' }] });
    await isDynamicallyAllowedOrigin('https://app.acme.com');
    await isDynamicallyAllowedOrigin('https://app.acme.com');
    expect(sendMock).toHaveBeenCalledTimes(1);
  });

  it('defaults to not allowed if DDB query throws', async () => {
    sendMock.mockRejectedValueOnce(new Error('network'));
    expect(await isDynamicallyAllowedOrigin('https://app.acme.com')).toBe(false);
  });
});
